import {
    BadRequestException,
    ForbiddenException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { CorrespondenceAttachment } from 'src/entities/correspondence-attachment.entity';
import { CorrespondenceParticipant } from 'src/entities/correspondence-participant.entity';
import { CorrespondenceThread } from 'src/entities/correspondence-thread.entity';
import { Correspondence } from 'src/entities/correspondence.entity';
import { Repository } from 'typeorm';
import { CreateThreadDto } from './dto/create-thread.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { Jobs } from 'src/jobs/entities/job.entity';
import { UpdateMessageDto } from './dto/update-message.dto';
import * as path from 'path';


@Injectable()
export class CorrespondenceService {
    constructor(
        @InjectRepository(CorrespondenceThread)
        private readonly threadRepository: Repository<CorrespondenceThread>,
        @InjectRepository(Jobs)
        private readonly jobsRepository: Repository<Jobs>,

        @InjectRepository(Correspondence)
        private readonly correspondenceRepository: Repository<Correspondence>,

        @InjectRepository(CorrespondenceParticipant)
        private readonly participantRepository: Repository<CorrespondenceParticipant>,

        @InjectRepository(CorrespondenceAttachment)
        private readonly attachmentRepository: Repository<CorrespondenceAttachment>,
    ) { }

    // =========================================================
    // CREATE THREAD
    // =========================================================
    async createThread(
        userId: number,
        dto: CreateThreadDto,
    ) {
        if (!dto.participants || dto.participants.length === 0) {
            throw new BadRequestException(
                'At least one participant is required',
            );
        }

        const participant = dto.participants[0];

        // Determine current user's type from the participant type
        const currentUserType =
            participant.participant_type === 'applicant'
                ? 'employer'
                : 'applicant';

        // Prevent sending to yourself
        if (participant.user_id === userId) {
            throw new BadRequestException(
                'You cannot create a conversation with yourself',
            );
        }

        const thread = this.threadRepository.create({
            subject: dto.subject,
            job_id: dto.job_id ?? null,
            created_by: userId,
            status: 'open',
            last_message_at: null,
            last_sender_id: null,
            last_sender_type: null,
        });

        const savedThread =
            await this.threadRepository.save(thread);

        const participants: CorrespondenceParticipant[] = [];

        // CURRENT USER
        participants.push(
            this.participantRepository.create({
                thread_id: savedThread.id,
                user_id: userId,
                participant_type: currentUserType,
                is_active: true,
                last_read_message_id: null,
            }),
        );

        // TARGET USER
        participants.push(
            this.participantRepository.create({
                thread_id: savedThread.id,
                user_id: participant.user_id,
                participant_type: participant.participant_type,
                is_active: true,
                last_read_message_id: null,
            }),
        );

        await this.participantRepository.save(participants);

        return {
            success: true,
            message: 'Conversation thread created successfully',
            data: await this.getThread(
                savedThread.id,
                userId,
            ),
        };
    }


    // =========================================================
    // GET THREAD
    // =========================================================

    async getThread(
        threadId: number,
        userId: number,
    ) {
        await this.checkParticipant(
            threadId,
            userId,
        );

        const thread =
            await this.threadRepository.findOne({
                where: {
                    id: threadId,
                },
                relations: [
                    'participants',
                ],
            });

        if (!thread) {
            throw new NotFoundException(
                'Conversation thread not found',
            );
        }

        return thread;
    }

    async getUserThreads(userId: number) {
        const threads = await this.threadRepository
            .createQueryBuilder('thread')

            .innerJoin(
                'thread.participants',
                'myParticipant',
                'myParticipant.user_id = :userId',
                { userId },
            )

            .leftJoinAndSelect(
                'thread.participants',
                'participant',
                'participant.is_active = :active',
                { active: 1 },
            )

            .leftJoinAndSelect(
                'participant.user',
                'participantUser',
            )

            .where('thread.status = :status', {
                status: 'open',
            })

            .orderBy(
                'thread.last_message_at',
                'DESC',
            )

            .addOrderBy(
                'thread.created_at',
                'DESC',
            )

            .getMany();

        const data = await Promise.all(
            threads.map(async (thread) => {

                // ==========================================
                // GET JOB + POSITION
                // ==========================================

                let job: any = null;

                if (thread.job_id) {
                    const jobData =
                        await this.jobsRepository
                            .createQueryBuilder('job')
                            .leftJoinAndSelect(
                                'job.position',
                                'position',
                            )
                            .where(
                                'job.id = :jobId',
                                {
                                    jobId: Number(
                                        thread.job_id,
                                    ),
                                },
                            )
                            .getOne();

                    if (jobData) {
                        job = {
                            id: jobData.id,

                            title:
                                jobData.title,

                            position:
                                jobData.position
                                    ? jobData.position.position_name
                                    : null,
                        };
                    }
                }

                // ==========================================
                // OTHER PARTICIPANTS
                // ==========================================

                const otherParticipants =
                    (thread.participants || []).filter(
                        (participant) =>
                            participant.user_id !== userId,
                    );

                // ==========================================
                // LAST MESSAGE
                // ==========================================

                const lastMessage =
                    await this.correspondenceRepository
                        .createQueryBuilder('message')
                        .where(
                            'message.thread_id = :threadId',
                            {
                                threadId: thread.id,
                            },
                        )
                        .orderBy(
                            'message.id',
                            'DESC',
                        )
                        .getOne();

                // ==========================================
                // RETURN THREAD
                // ==========================================

                return {
                    id:
                        thread.id,

                    created_by:
                        thread.created_by,

                    job_id:
                        thread.job_id,

                    job: job,

                    subject:
                        thread.subject,

                    chat_with:
                        otherParticipants.map(
                            (participant) => ({
                                user_id:
                                    participant.user_id,

                                username:
                                    participant.user
                                        ?.username ??
                                    null,

                                profile_picture:
                                    participant.user
                                        ?.profile_picture ??
                                    null,

                                email:
                                    participant.user
                                        ?.email ??
                                    null,

                                participant_type:
                                    participant.participant_type,
                            }),
                        ),

                    last_message:
                        lastMessage
                            ? {
                                id:
                                    lastMessage.id,

                                message:
                                    lastMessage.message,

                                category:
                                    lastMessage.category,

                                sender_id:
                                    lastMessage.sender_id,

                                sender_type:
                                    lastMessage.sender_type,

                                created_at:
                                    lastMessage.created_at,

                                is_mine:
                                    lastMessage.sender_id ===
                                    userId,
                            }
                            : null,

                    last_message_at:
                        thread.last_message_at,

                    last_sender_type:
                        thread.last_sender_type,

                    last_sender_id:
                        thread.last_sender_id,

                    applicant_unread_count:
                        thread.applicant_unread_count,

                    employer_unread_count:
                        thread.employer_unread_count,

                    status:
                        thread.status,
                };
            }),
        );

        return {
            success: true,

            message:
                'Conversation threads fetched successfully',

            data,
        };
    }

    
    private getUnreadCount(
        thread: CorrespondenceThread,
        userId: number,
    ): number {
        const participant = thread.participants?.find(
            (p) => p.user_id === userId,
        );

        if (!participant) {
            return 0;
        }

        if (participant.participant_type === 'applicant') {
            return thread.applicant_unread_count ?? 0;
        }

        if (participant.participant_type === 'employer') {
            return thread.employer_unread_count ?? 0;
        }

        return 0;
    }

    // =========================================================
    // SEND MESSAGE
    // =========================================================
    async getMessage(
        threadId: number,
        userId: number,
        page = 1,
        limit = 30,
    ) {
        // 1. Check if current user belongs to the thread
        const currentParticipant =
            await this.participantRepository.findOne({
                where: {
                    thread_id: threadId,
                    user_id: userId,
                    is_active: true,
                },
            });

        if (!currentParticipant) {
            throw new ForbiddenException(
                'You are not a participant in this conversation',
            );
        }

        // 2. Get thread
        const thread = await this.threadRepository.findOne({
            where: {
                id: threadId,
            },
        });

        if (!thread) {
            throw new NotFoundException(
                'Conversation thread not found',
            );
        }

        // 3. Get participants
        const participants =
            await this.participantRepository
                .createQueryBuilder('participant')
                .leftJoinAndSelect(
                    'participant.user',
                    'user',
                )
                .where(
                    'participant.thread_id = :threadId',
                    { threadId },
                )
                .andWhere(
                    'participant.is_active = :active',
                    { active: true },
                )
                .getMany();

        // 4. Get Job
        let job: any = null;

        if (thread.job_id) {
            const jobData = await this.jobsRepository
                .createQueryBuilder('job')
                .leftJoinAndSelect(
                    'job.position',
                    'position',
                )
                .where('job.id = :jobId', {
                    jobId: thread.job_id,
                })
                .getOne();

            if (jobData) {
                job = {
                    id: jobData.id,
                    title: jobData.title,
                    position: jobData.position
                        ? jobData.position.position_name
                        : null,
                };
            }
        }

        // 5. Pagination
        const skip = (page - 1) * limit;

        const [
            messages,
            total,
        ] = await this.correspondenceRepository
            .createQueryBuilder('message')
            .leftJoinAndSelect(
                'message.attachments',
                'attachments',
            )
            .where(
                'message.thread_id = :threadId',
                { threadId },
            )
            .andWhere(
                'message.is_deleted = :isDeleted',
                {
                    isDeleted: false,
                },
            )

            .orderBy('message.created_at', 'ASC')
            .skip(skip)
            .take(limit)
            .getManyAndCount();

        // 6. Format participants
        const formattedParticipants =
            participants.map((participant) => ({
                user_id: participant.user_id,

                participant_type:
                    participant.participant_type,

                username:
                    participant.user?.username ??

                    null,

                profile_picture:
                    participant.user?.profile_picture ??
                    null,
            }));

        // 7. Format messages
        const formattedMessages = messages.map(
            (message) => ({
                id: message.id,

                sender_type:
                    message.sender_type,

                sender_id:
                    message.sender_id,

                category:
                    message.category,

                message:
                    message.message,

                created_at:
                    message.created_at,

                attachments:
                    (message.attachments || []).map(
                        (attachment) => ({
                            id: attachment.id,
                            original_name:
                                attachment.original_name,
                            file_name:
                                attachment.file_name,
                            file_path:
                                attachment.file_path,
                            mime_type:
                                attachment.mime_type,
                            file_size:
                                attachment.file_size,
                        }),
                    ),
            }),
        );

        // 8. Return response
        return {
            success: true,

            message:
                'Messages fetched successfully',

            data: {
                thread: {
                    id: thread.id,

                    job: job,

                    subject:
                        thread.subject,

                    participants:
                        formattedParticipants,
                },

                messages:
                    formattedMessages,

                page,

                limit,

                total,

                totalPages:
                    Math.ceil(total / limit),
            },
        };
    }
    async sendMessage(
        userId: number,
        dto: SendMessageDto,
        file?: any,
    ) {
        // Get current user's participation in this thread
        const participant =
            await this.participantRepository.findOne({
                where: {
                    thread_id: dto.thread_id,
                    user_id: userId,
                    is_active: true,
                },
            });

        if (!participant) {
            throw new ForbiddenException(
                'You are not a participant in this conversation',
            );
        }

        // Get sender type from correspondence_participants
        const senderType =
            participant.participant_type;

        const thread =
            await this.threadRepository.findOne({
                where: {
                    id: dto.thread_id,
                },
            });

        if (!thread) {
            throw new NotFoundException(
                'Conversation thread not found',
            );
        }

        if (thread.status === 'closed') {
            throw new BadRequestException(
                'This conversation is closed',
            );
        }

        const message =
            this.correspondenceRepository.create({
                applicant_id:
                    this.getLegacyApplicantId(thread),

                thread_id: dto.thread_id,

                reply_to_id:
                    dto.reply_to_id ?? null,

                sender_type: senderType,

                sender_id: userId,

                category:
                    dto.category ?? 'general',

                subject:
                    dto.subject ?? thread.subject,

                message: dto.message,

                meta: dto.meta
                    ? JSON.stringify(dto.meta)
                    : null,

                visible_to_applicant: true,

                visible_to_employer: true,

                is_read: false,

                status: null,

                rejection_reason: null,
            });

        const savedMessage =
            await this.correspondenceRepository.save(
                message,
            );
        if (file) {
            const picture = path
                .relative(process.cwd(), file.path)
                .split(path.sep)
                .join('/');

            const attachment =
                this.attachmentRepository.create({
                    correspondence_id: savedMessage.id,

                    original_name:
                        file.originalname,

                    file_name:
                        file.filename,

                    file_path:
                        picture,

                    mime_type:
                        file.mimetype,

                    file_size:
                        file.size,
                });

            await this.attachmentRepository.save(
                attachment,
            );
        }
        // Update thread
        thread.last_message_at =
            savedMessage.created_at ?? new Date();

        thread.last_sender_id =
            userId;

        thread.last_sender_type =
            senderType;

        // Optional but recommended if you added this column
        // thread.last_message_id =
        //     savedMessage.id;

        // Update unread count
        if (senderType === 'employer') {
            thread.applicant_unread_count =
                (thread.applicant_unread_count ?? 0) + 1;
        }

        if (senderType === 'applicant') {
            thread.employer_unread_count =
                (thread.employer_unread_count ?? 0) + 1;
        }

        await this.threadRepository.save(
            thread,
        );

        return this.getMessages(
            savedMessage.id,
        );
    }

    // =========================================================
    // GET MESSAGE
    // =========================================================

    async getMessages(messageId: number) {
        const message =
            await this.correspondenceRepository.findOne({
                where: {
                    id: messageId,
                },
                relations: [
                    'attachments',
                ],
            });

        if (!message) {
            throw new NotFoundException(
                'Message not found',
            );
        }

        return message;
    }

    async updateMessage(
        messageId: number,
        userId: number,
        dto: UpdateMessageDto,
    ) {
        const message =
            await this.correspondenceRepository.findOne({
                where: {
                    id: messageId,
                },
            });

        if (!message) {
            throw new NotFoundException(
                'Message not found',
            );
        }

        // Only message owner can edit
        if (message.sender_id !== userId) {
            throw new ForbiddenException(
                'You can only update your own message',
            );
        }

        // Make sure message belongs to a thread
        if (!message.thread_id) {
            throw new BadRequestException(
                'Message is not associated with a conversation',
            );
        }

        const participant =
            await this.participantRepository.findOne({
                where: {
                    thread_id: message.thread_id,
                    user_id: userId,
                    is_active: true,
                },
            });

        if (!participant) {
            throw new ForbiddenException(
                'You are not a participant in this conversation',
            );
        }

        message.message = dto.message;

        if (dto.category) {
            message.category = dto.category;
        }

        const updatedMessage =
            await this.correspondenceRepository.save(
                message,
            );

        return {
            success: true,
            message: 'Message updated successfully',
            data: await this.getMessages(
                updatedMessage.id,
            ),
        };
    }

    async deleteMessage(
        messageId: number,
        userId: number,
    ) {
        const message =
            await this.correspondenceRepository.findOne({
                where: {
                    id: messageId,
                },
            });

        if (!message) {
            throw new NotFoundException(
                'Message not found',
            );
        }

        // Only owner can delete
        if (message.sender_id !== userId) {
            throw new ForbiddenException(
                'You can only delete your own message',
            );
        }

        if (message.is_deleted) {
            throw new BadRequestException(
                'Message has already been deleted',
            );
        }

        // Make sure user is still a participant
        if (message.thread_id) {
            const participant =
                await this.participantRepository.findOne({
                    where: {
                        thread_id: message.thread_id,
                        user_id: userId,
                        is_active: true,
                    },
                });

            if (!participant) {
                throw new ForbiddenException(
                    'You are not a participant in this conversation',
                );
            }
        }

        message.is_deleted = true;
        message.deleted_at = new Date();

        await this.correspondenceRepository.save(
            message,
        );

        return {
            success: true,
            message: 'Message deleted successfully',
            data: {
                id: message.id,
                is_deleted: true,
                deleted_at: message.deleted_at,
            },
        };
    }


    // =========================================================
    // MARK AS READ
    // =========================================================

    async markAsRead(
        threadId: number,
        userId: number,
        messageId: number,
    ) {
        const participant =
            await this.participantRepository.findOne({
                where: {
                    thread_id: threadId,
                    user_id: userId,
                    is_active: true,
                },
            });

        if (!participant) {
            throw new ForbiddenException(
                'You are not a participant in this conversation',
            );
        }

        participant.last_read_message_id =
            messageId;

        await this.participantRepository.save(
            participant,
        );

        await this.correspondenceRepository
            .createQueryBuilder()
            .update(Correspondence)
            .set({
                is_read: true,
            })
            .where(
                'thread_id = :threadId',
                { threadId },
            )
            .andWhere(
                'sender_id != :userId',
                { userId },
            )
            .andWhere(
                'id <= :messageId',
                { messageId },
            )
            .execute();

        return {
            success: true,
            message: 'Messages marked as read',
        };
    }

    // =========================================================
    // CLOSE THREAD
    // =========================================================

    async closeThread(
        threadId: number,
        userId: number,
    ) {
        await this.checkParticipant(
            threadId,
            userId,
        );

        const thread =
            await this.threadRepository.findOne({
                where: {
                    id: threadId,
                },
            });

        if (!thread) {
            throw new NotFoundException(
                'Conversation not found',
            );
        }

        thread.status = 'closed';

        await this.threadRepository.save(
            thread,
        );

        return {
            success: true,
            message: 'Conversation closed successfully',
        };
    }

    // =========================================================
    // PRIVATE PARTICIPANT CHECK
    // =========================================================

    private async checkParticipant(
        threadId: number,
        userId: number,
    ) {
        const participant =
            await this.participantRepository.findOne({
                where: {
                    thread_id: threadId,
                    user_id: userId,
                    is_active: true,
                },
            });

        if (!participant) {
            throw new ForbiddenException(
                'You are not a participant in this conversation',
            );
        }

        return participant;
    }

    // =========================================================
    // LEGACY APPLICANT ID
    // =========================================================

    private getLegacyApplicantId(
        thread: CorrespondenceThread,
    ): number {
        return thread.applicant_id ?? 0;
    }
}