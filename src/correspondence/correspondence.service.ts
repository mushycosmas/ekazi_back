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
import { AddParticipantDto } from './dto/add-participant.dto';


@Injectable()
export class CorrespondenceService {
  constructor(
    @InjectRepository(CorrespondenceThread)
    private readonly threadRepository: Repository<CorrespondenceThread>,

    @InjectRepository(Correspondence)
    private readonly correspondenceRepository: Repository<Correspondence>,

    @InjectRepository(CorrespondenceParticipant)
    private readonly participantRepository: Repository<CorrespondenceParticipant>,

    @InjectRepository(CorrespondenceAttachment)
    private readonly attachmentRepository: Repository<CorrespondenceAttachment>,
  ) {}

  // =========================================================
  // CREATE THREAD
  // =========================================================
async createThread(
  userId: number,
  senderType:
    | 'admin'
    | 'employer'
    | 'applicant'
    | 'system',
  dto: CreateThreadDto,
) {
  if (!dto.participants || dto.participants.length === 0) {
    throw new BadRequestException(
      'At least one receiver is required',
    );
  }

  // Prevent sending to yourself
  const receiverExists = dto.participants.some(
    (participant) => participant.user_id !== userId,
  );

  if (!receiverExists) {
    throw new BadRequestException(
      'You cannot create a conversation with yourself',
    );
  }

  // 1. Create thread
  const thread = this.threadRepository.create({
    subject: dto.subject,
    job_id: dto.job_id ?? null,

    // Current authenticated user
    created_by: userId,

    status: 'open',

    last_message_at: null,
    last_sender_id: null,
    last_sender_type: null,
  });

  const savedThread =
    await this.threadRepository.save(thread);

  // 2. Create participants
  const participants: CorrespondenceParticipant[] = [];

  // Sender = current authenticated user
  participants.push(
    this.participantRepository.create({
      thread_id: savedThread.id,
      user_id: userId,
      participant_type: senderType,
      is_active: true,
      last_read_message_id: null,
    }),
  );

  // Receiver(s) = frontend
  for (const participant of dto.participants) {
    if (participant.user_id === userId) {
      continue;
    }

    participants.push(
      this.participantRepository.create({
        thread_id: savedThread.id,
        user_id: participant.user_id,
        participant_type: participant.participant_type,
        is_active: true,
        last_read_message_id: null,
      }),
    );
  }

  // 3. Save participants
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
//   async createThread(
//     userId: number,
//     dto: CreateThreadDto,
//   ) {
//     if (!dto.participants || dto.participants.length === 0) {
//       throw new BadRequestException(
//         'At least one participant is required',
//       );
//     }

//     const thread = this.threadRepository.create({
//       subject: dto.subject,
//       job_id: dto.job_id ?? null,
//       created_by: userId,
//       status: 'open',
//       last_message_at: null,
//       last_sender_id: null,
//       last_sender_type: null,
//     });

//     const savedThread =
//       await this.threadRepository.save(thread);

//     const participants = dto.participants.map((participant) =>
//       this.participantRepository.create({
//         thread_id: savedThread.id,
//         user_id: participant.user_id,
//         participant_type: participant.participant_type,
//         is_active: true,
//         last_read_message_id: null,
//       }),
//     );

//     // Add creator automatically if not included
//     const creatorExists = participants.some(
//       (participant) =>
//         participant.user_id === userId,
//     );

//     if (!creatorExists) {
//       participants.push(
//         this.participantRepository.create({
//           thread_id: savedThread.id,
//           user_id: userId,
//           participant_type: 'system',
//           is_active: true,
//           last_read_message_id: null,
//         }),
//       );
//     }

//     await this.participantRepository.save(participants);

//     return {
//       success: true,
//       message: 'Conversation thread created successfully',
//       data: await this.getThread(
//         savedThread.id,
//         userId,
//       ),
//     };
//   }

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

  // =========================================================
  // GET USER THREADS
  // =========================================================

  async getUserThreads(userId: number) {
    const participants =
      await this.participantRepository.find({
        where: {
          user_id: userId,
          is_active: true,
        },
        relations: [
          'thread',
        ],
        order: {
          updated_at: 'DESC',
        },
      });

    return {
      success: true,
      message: 'Conversation threads fetched successfully',
      data: participants.map(
        (participant) => participant.thread,
      ),
    };
  }

  // =========================================================
  // SEND MESSAGE
  // =========================================================

  async sendMessage(
    userId: number,
    senderType:
      | 'admin'
      | 'employer'
      | 'applicant'
      | 'system',
    dto: SendMessageDto,
  ) {
    await this.checkParticipant(
      dto.thread_id,
      userId,
    );

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

    thread.last_message_at =
      new Date();

    thread.last_sender_id =
      userId;

    thread.last_sender_type =
      senderType;

    await this.threadRepository.save(
      thread,
    );

    return this.getMessage(
      savedMessage.id,
    );
  }

  // =========================================================
  // GET MESSAGE
  // =========================================================

  async getMessage(messageId: number) {
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

  // =========================================================
  // GET THREAD MESSAGES
  // =========================================================

  async getMessages(
    threadId: number,
    userId: number,
    page = 1,
    limit = 30,
  ) {
    await this.checkParticipant(
      threadId,
      userId,
    );

    page = Math.max(
      1,
      Number(page) || 1,
    );

    limit = Math.min(
      100,
      Math.max(
        1,
        Number(limit) || 30,
      ),
    );

    const [messages, total] =
      await this.correspondenceRepository.findAndCount(
        {
          where: {
            thread_id: threadId,
          },
          relations: [
            'attachments',
          ],
          order: {
            created_at: 'ASC',
          },
          skip: (page - 1) * limit,
          take: limit,
        },
      );

    return {
      success: true,
      message: 'Messages fetched successfully',
      data: messages,
      page,
      limit,
      total,
      totalPages: Math.ceil(
        total / limit,
      ),
    };
  }

  // =========================================================
  // ADD PARTICIPANT
  // =========================================================

  async addParticipant(
    threadId: number,
    currentUserId: number,
    dto: AddParticipantDto,
  ) {
    await this.checkParticipant(
      threadId,
      currentUserId,
    );

    const existing =
      await this.participantRepository.findOne({
        where: {
          thread_id: threadId,
          user_id: dto.user_id,
        },
      });

    if (existing) {
      existing.is_active = true;
      existing.participant_type =
        dto.participant_type;

      await this.participantRepository.save(
        existing,
      );

      return {
        success: true,
        message: 'Participant restored successfully',
        data: existing,
      };
    }

    const participant =
      this.participantRepository.create({
        thread_id: threadId,
        user_id: dto.user_id,
        participant_type:
          dto.participant_type,
        is_active: true,
        last_read_message_id: null,
      });

    const saved =
      await this.participantRepository.save(
        participant,
      );

    return {
      success: true,
      message: 'Participant added successfully',
      data: saved,
    };
  }

  // =========================================================
  // REMOVE PARTICIPANT
  // =========================================================

  async removeParticipant(
    threadId: number,
    currentUserId: number,
    participantUserId: number,
  ) {
    await this.checkParticipant(
      threadId,
      currentUserId,
    );

    const participant =
      await this.participantRepository.findOne({
        where: {
          thread_id: threadId,
          user_id: participantUserId,
        },
      });

    if (!participant) {
      throw new NotFoundException(
        'Participant not found',
      );
    }

    participant.is_active = false;

    await this.participantRepository.save(
      participant,
    );

    return {
      success: true,
      message: 'Participant removed successfully',
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