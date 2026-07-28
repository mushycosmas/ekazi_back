import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Logger } from '@nestjs/common';

import { Stage } from 'src/entities/stage.entity';
import { Users } from 'src/entities/users.entity';
import { Jobs } from 'src/jobs/entities/job.entity';
import { JobStage } from 'src/jobs/entities/job-stage.entity';
import { ApplicantApplication } from 'src/entities/applicants/applicant-applicantions.entity';
import { Regions } from 'src/entities/regions.entity';
import { Applicants } from 'src/entities/applicants/applicants.entity';
import * as Handlebars from 'handlebars';



import { MailService } from 'src/mail/mail.service';

import { BulkShortListDto } from './dto/bulk-shortlist.dto';

import * as fs from 'fs';
import * as path from 'path';
import { ApplicantListing } from 'src/entities/applicants/applicant-listings.entity';
import { JobTestResult } from 'src/jobs/entities/job-test-results.entity';
import { BulkScreeningDto } from './dto/bulk-screning.dto';
import { InterviewStage } from './stages/interview.stage';
import { InterviewStageDto } from './dto/bulk-interview.dto';
import { SelectionStage } from './stages/selection.stage';
import { SelectionStageDto } from './dto/bulk-selection.dto';
import { BackgroundCheckStage } from './stages/backbground-check.stage';
import { BackgroundChecktageDto } from './dto/bulk-background-check.dto';
import { OfferStage } from './stages/offer.stage';
import { OfferDto } from './dto/bulk-offer.dto';
import { EmployedDto } from './dto/employed.dto';
import { EmployedStage } from './stages/employed.stage';
import { MoodleUser } from 'src/entities/moodle-user.entity';


@Injectable()
export class ApplicantStagesService {

    private readonly logger =
        new Logger(ApplicantStagesService.name);

    constructor(

        private readonly dataSource: DataSource,
        private readonly interviewStage: InterviewStage,
        private readonly selectionStageHandler: SelectionStage,
        private readonly backgrounCheckStageHandler: BackgroundCheckStage,
        private readonly offerStageHandler: OfferStage,
        private readonly employedStageHandler: EmployedStage,



        @InjectRepository(MoodleUser, 'second_db')
        private readonly moodleUserRepository: Repository<MoodleUser>,

        @InjectRepository(Jobs)
        private readonly jobRepository: Repository<Jobs>,
        @InjectRepository(Stage)
        private readonly stageRepository: Repository<Stage>,
        @InjectRepository(JobStage)
        private readonly jobStageRepository: Repository<JobStage>,
        @InjectRepository(ApplicantApplication)
        private readonly applicantApplicationRepository: Repository<ApplicantApplication>,
        @InjectRepository(Applicants)
        private readonly applicantsRepository: Repository<Applicants>,
        @InjectRepository(Users)
        private readonly usersRepository: Repository<Users>,
        @InjectRepository(ApplicantListing)
        private readonly applicantListingRepository: Repository<ApplicantListing>,

        @InjectRepository(JobTestResult)
        private readonly jobTestResultRepository: Repository<JobTestResult>,

        @InjectRepository(Regions)
        private readonly regionRepository: Repository<Regions>,






        private readonly mailService: MailService

    ) { }


    async applied(jobId: number) {
        return this.getApplicantsByStage(jobId, 'Applied');
    }

    async shortlisted(jobId: number) {
        return this.getApplicantsByStage(jobId, 'Shortlisted');
    }

    async screening(jobId: number) {
        return this.getApplicantsByStage(jobId, 'Screening');
    }

    async interview(jobId: number) {
        return this.getApplicantsByStage(jobId, 'Interview');
    }
    async selected(jobId: number) {
        return this.getApplicantsByStage(jobId, 'Selection');
    }

    async background(jobId: number) {
        return this.getApplicantsByStage(jobId, 'Background Check');
    }

    async offer(jobId: number) {
        return this.getApplicantsByStage(jobId, 'Offer');
    }

    async employed(jobId: number) {
        return this.getApplicantsByStage(jobId, 'Employed');
    }

    private async getStageStatistics(jobId: number) {

        const stages = await this.stageRepository.find({
            where: {},
        });


        const statistics = {};

        const result = await this.applicantListingRepository
            .createQueryBuilder('listing')
            .leftJoin(
                'listing.stage',
                'stage',
            )
            .select(
                'stage.stage_name',
                'stage_name',
            )
            .addSelect(
                'COUNT(listing.id)',
                'total',
            )
            .where(
                'listing.job_id = :jobId',
                {
                    jobId,
                },
            )
            .groupBy(
                'stage.stage_name',
            )
            .getRawMany();

        // initialize all stages with 0

        stages.forEach((stage) => {

            statistics[stage.stage_name] = 0;

        });

        // fill counts

        result.forEach((item) => {

            statistics[item.stage_name] =
                Number(item.total);

        });
        return statistics;
    }

    async getApplicantsByStage(
        jobId: number,
        stageName: string,
        page: number = 1,
        limit: number = 10,
        search?: string,
    ) {

        // ============================
        // Find Stage
        // ============================
        const stage = await this.stageRepository.findOne({
            where: {
                stage_name: stageName,
            },
        });


        if (!stage) {
            throw new NotFoundException(
                'Stage not found',
            );
        }

        // ============================
        // Query Applicants
        // ============================
        const query =
            this.applicantListingRepository
                .createQueryBuilder('listing')


                // Applicant
                .leftJoinAndSelect(
                    'listing.applicant',
                    'applicant',
                )

                // User email
                .leftJoinAndSelect(
                    'applicant.user',
                    'user',
                )

                // Stage
                .leftJoinAndSelect(
                    'listing.stage',
                    'stage',
                )

                // Applicant Application
                .leftJoinAndSelect(
                    'listing.application',
                    'application',
                )

                // Screening Test Result
                .leftJoinAndSelect(
                    JobTestResult,
                    'test',
                    `
                test.job_id = listing.job_id
                AND 
                test.applicant_id = listing.applicant_id
                `,
                )


                .where(
                    'listing.job_id = :jobId',
                    {
                        jobId,
                    },
                )


                .andWhere(
                    'listing.stage_id = :stageId',
                    {
                        stageId: stage.id,
                    },
                );


        // ============================
        // Search
        // ============================
        if (search) {

            query.andWhere(
                `
            (
                applicant.first_name LIKE :search
                OR applicant.middle_name LIKE :search
                OR applicant.last_name LIKE :search
                OR user.email LIKE :search
                OR application.letter LIKE :search
            )
            `,
                {
                    search: `%${search}%`,
                },
            );
        }



        // ============================
        // Pagination
        // ============================
        const [
            rows,
            total,
        ] = await query

            .orderBy(
                'listing.id',
                'DESC',
            )

            .skip(
                (page - 1) * limit,
            )

            .take(
                limit,
            )

            .getManyAndCount();

        //==========================
        // Stage Statics

        ///===================
        const statistics = await this.getStageStatistics(jobId);

        // ============================
        // Response
        // ============================
        return {

            success: true,

            message:
                `${stageName} applicants fetched successfully.`,
            data:

                rows.map((item) => ({


                    id: item.id,
                    job_id:
                        item.job_id,
                    applicant_id:
                        item.applicant_id,
                    application_id:
                        item.application_id,
                    moved_at: item.created_at,
                    stage_id:
                        item.stage_id,
                    status:
                        item.status,
                    hide:
                        item.hide,
                    // Stage
                    stage:
                        item.stage
                            ? {
                                id:
                                    item.stage.id,

                                name:
                                    item.stage.stage_name,
                            }

                            : null,



                    // Applicant
                    applicant:
                        item.applicant
                            ? {

                                id:
                                    item.applicant.id,
                                first_name: item.applicant.first_name,
                                middle_name: item.applicant.middle_name,
                                last_name: item.applicant.last_name,
                                email: item.applicant.user?.email
                                    ?? null,
                                picture: item.applicant.picture,

                            }
                            : null,
                    // Application
                    application:
                        item.application
                            ? {
                                id: item.application.id,
                                letter: item.application.letter,
                                attachment: item.application.attachment,
                                status: item.application.status,
                                hide: item.application.hide,
                                consent_verified: item.application.consent_verified,
                                created_at: item.application.created_at,
                                updated_at: item.application.updated_at,

                            }
                            : null,

                    // Screening
                    screening:
                        item['test']
                            ? {
                                test_date: item['test'].test_date,
                                test_duration: item['test'].test_duration,
                                test_deadline: item['test'].test_deadline,
                                user_name: item['test'].user_name,
                                user_password: item['test'].user_password,

                            }

                            : null,


                })),
            statistics,

            pagination: {

                total,

                page,

                limit,

                totalPages:
                    Math.ceil(
                        total / limit,
                    ),

            },

        };
    }

    async bulkShortList(
        jobId: number,
        dto: BulkShortListDto,
        user: Users
    ) {

        const stage =
            await this.stageRepository.findOne({

                where: {
                    id: dto.stage_id
                }

            });


        if (!stage) {
            throw new NotFoundException(
                'Stage not found'
            );
        }
        switch (stage.stage_name) {

            case 'Shortlisted':

                await this.shortListedStage(
                    jobId,
                    dto,
                    user
                );

                break;

            default:

                throw new Error(
                    'Invalid stage selected'
                );

        }

        return true;

    }

    async shortListedStage(
        jobId: number,
        dto: BulkShortListDto,
        user: Users,
    ) {

        console.log('current user', user);
        const queryRunner = this.dataSource.createQueryRunner();

        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {

            // ============================
            // Stage
            // ============================
            const stage = await this.stageRepository.findOne({
                where: {
                    id: dto.stage_id,
                },
            });


            if (!stage) {
                throw new NotFoundException(
                    'Stage not found'
                );
            }



            // ============================
            // Job
            // ============================
            const job = await this.jobRepository.findOne({
                where: {
                    id: jobId
                },
                relations: [
                    'client',
                    'client.phones',
                    'position'
                ]
            });


            if (!job) {
                throw new NotFoundException(
                    'Job not found'
                );
            }



            // ============================
            // Update Job Stage
            // ============================
            await queryRunner.manager.update(
                Jobs,
                jobId,
                {
                    stage_id: dto.stage_id
                }
            );



            // ============================
            // Multiple Applicants
            // ============================
            for (const applicantId of dto.applicant_id) {



                // ============================
                // Job Stage
                // ============================

                let jobStage =
                    await this.jobStageRepository.findOne({
                        where: {
                            job_id: jobId,
                            applicant_id: applicantId,
                            stage_id: dto.stage_id
                        }
                    });


                if (!jobStage) {
                    const data = {
                        job_id: jobId,
                        applicant_id: applicantId,
                        stage_id: dto.stage_id,
                        creator_id: user.id,
                        updator_id: user.id,
                    };



                    jobStage = await queryRunner.manager.save(JobStage, data);

                }

                // ============================
                // Applicant Application
                // ============================

                //   await queryRunner.manager.update(
                //         ApplicantApplication,

                //         {
                //             job_id: dto.job_id,
                //             applicant_id: applicantId
                //         },
                //         {
                //             stage_id: dto.stage_id,
                //             status: stage.stage_name
                //         }
                //     );
                // ============================
                // Applicant Application
                // ============================
                const application =
                    await this.applicantApplicationRepository.findOne({
                        where: {
                            job_id: jobId,
                            applicant_id: applicantId,
                        },
                    });

                // Update application only if it exists
                if (application) {
                    await queryRunner.manager.update(
                        ApplicantApplication,
                        application.id,
                        {
                            stage_id: dto.stage_id,
                            status: stage.stage_name,
                        },
                    );
                }

                // ============================
                // Applicant Listing
                // ============================

                // ============================
                // Applicant Listing
                // ============================

                let listing =
                    await this.applicantListingRepository.findOne({
                        where: {
                            job_id: jobId,
                            applicant_id: applicantId,
                        },
                    });

                if (!listing) {

                    listing = this.applicantListingRepository.create({

                        job_id: jobId,

                        applicant_id: applicantId,

                        application_id: application?.id ?? null,

                        stage_id: dto.stage_id,

                        status: stage.stage_name,

                        hide: 1,

                    });

                } else {

                    listing.application_id = application?.id ?? null;

                    listing.stage_id = dto.stage_id;

                    listing.status = stage.stage_name;

                    listing.hide = 1;

                }

                await queryRunner.manager.save(
                    ApplicantListing,
                    listing,
                );
                // ============================
                // Applicant
                // ============================

                const applicant =
                    await this.applicantsRepository.findOne({
                        where: {
                            id: applicantId
                        },
                        relations: [
                            'user'
                        ]
                    });
                if (applicant) {
                    await this.sendShortListEmail({

                        applicant,

                        job,

                        stage,

                        dto

                    });
                }

            }
            await queryRunner.commitTransaction();
            return {

                success: true,

                message:
                    'Applicants shortlisted successfully'

            };


        }
        catch (error) {

            await queryRunner.rollbackTransaction();

            throw error;

        }
        finally {

            await queryRunner.release();

        }

    }

    async screeningStage(
        jobId: number,
        dto: BulkScreeningDto,
        user: Users,
    ) {

        const stage =
            await this.stageRepository.findOne({

                where: {
                    id: dto.stage_id
                }

            });


        if (!stage) {
            throw new NotFoundException({
                success: false,
                message: 'The selected stage was not found. Please refresh and try again.',
                error_code: 'STAGE_NOT_FOUND',
            });
        }
        const queryRunner = this.dataSource.createQueryRunner();

        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            // ============================
            // Stage
            // ============================
            const stage = await this.stageRepository.findOne({
                where: { id: dto.stage_id },
            });

            if (!stage) {
                throw new NotFoundException({
                    success: false,
                    message: 'The selected stage was not found. Please refresh and try again.',
                    error_code: 'STAGE_NOT_FOUND',
                });
            }

            // ============================
            // Job
            // ============================
            const job = await this.jobRepository.findOne({
                where: { id: jobId },
                relations: [
                    'client',
                    'client.phones',
                    'position',
                ],
            });

            if (!job) {
                throw new NotFoundException({
                    success: false,
                    message: 'The selected Job was not found. Please refresh and try again.',
                    error_code: 'STAGE_NOT_FOUND',
                });

            }

            // ============================
            // Update Job Stage
            // ============================
            await queryRunner.manager.update(
                Jobs,
                jobId,
                {
                    stage_id: dto.stage_id,
                },
            );

            // ============================
            // Invite Location
            // ============================
            const inviteLocation =
                await this.regionRepository.findOne({
                    where: {
                        id: dto.region_id,
                    },
                    relations: ['country'],
                });

            // ============================
            // Loop Applicants
            // ============================
            for (const applicantId of dto.applicant_id) {

                // ----------------------------
                // Job Stage
                // ----------------------------
                let jobStage =
                    await this.jobStageRepository.findOne({
                        where: {
                            job_id: jobId,
                            stage_id: dto.stage_id,
                            applicant_id: applicantId,
                        },
                    });

                if (!jobStage) {
                    jobStage =
                        await queryRunner.manager.save(
                            JobStage,
                            {
                                job_id: jobId,
                                stage_id: dto.stage_id,
                                applicant_id: applicantId,
                                creator_id: user.id,
                                updator_id: user.id,
                            },
                        );
                }

                // ----------------------------
                // Applicant Application
                // ----------------------------


                const application =
                    await this.applicantApplicationRepository.findOne({
                        where: {
                            job_id: jobId,
                            applicant_id: applicantId,
                        },
                    });


                if (application) {

                    await queryRunner.manager.update(
                        ApplicantApplication,
                        application.id,
                        {
                            stage_id: dto.stage_id,
                            status: stage.stage_name,
                        },
                    );

                }

                // ----------------------------
                // Applicant Listing
                // ----------------------------
                // ----------------------------
                // Applicant Listing History
                // ----------------------------

                const existingListing =
                    await queryRunner.manager.findOne(
                        ApplicantListing,
                        {
                            where: {
                                job_id: jobId,
                                applicant_id: applicantId,
                                stage_id: dto.stage_id,
                            },
                        },
                    );


                // Create new history record
                // Do not update old stage

                if (!existingListing) {
                    const listing =
                        queryRunner.manager.create(
                            ApplicantListing,
                            {
                                stage_id: dto.stage_id,

                                job_id: jobId,

                                applicant_id: applicantId,

                                application_id:
                                    application?.id ?? null,

                                job_stage_id:
                                    jobStage.id,

                                status_id:
                                    dto.stage_id,

                                status:
                                    stage.stage_name,

                                hide: 1,

                                created_by:
                                    user.id,

                                updated_by:
                                    user.id,
                            },
                        );


                    await queryRunner.manager.save(
                        ApplicantListing,
                        listing,
                    );


                    await queryRunner.manager.save(
                        ApplicantListing,
                        listing,
                    );

                }

                // ============================
                // Job Test Result
                // ============================

                let test =
                    await this.jobTestResultRepository.findOne({
                        where: {
                            job_id: jobId,
                            applicant_id: applicantId,
                        },
                    });
                if (!test) {

                    test =
                        this.jobTestResultRepository.create({

                            job_id: jobId,

                            applicant_id: applicantId,

                        });

                }
                // ============================
                // Generate Screening Login
                // ============================

                const applicant =
                    await this.applicantsRepository.findOne({
                        where: {
                            id: applicantId,
                        },
                        relations: [
                            'user',
                        ],
                    });
                if (!applicant) {
                    continue;
                }
                let username = '';
                let password = '';
                if (applicant.user?.email) {

                    username =
                        await this.generateUniqueUsername(
                            applicant.user.email,
                        );

                    password =this.generatePassword();

                    await this.createMoodleUser(
                        applicant,
                        username,
                        password,
                    );


                }
                // ============================
                // Save Test Details
                // ============================

                test.test_date =
                    dto.test_date
                        ? new Date(dto.test_date)
                        : undefined;
                test.test_duration =
                    dto.test_duration?.toString()
                    ?? '';
                test.test_deadline =
                    dto.test_deadline
                    ?? '';
                test.user_name = username;
                test.user_password = password;
                test.job_stage_id = jobStage.id;
                test.creator_id =
                    user.id;



                test.updator_id =
                    user.id;
                test.reminder_sent_12hr = true;
                test.reminder_sent_18hr = true;



                await this.jobTestResultRepository.save(test);



                // ============================
                // Send Screening Email
                // ============================

                await this.sendScreeningEmail({

                    applicant,

                    job,

                    stage,

                    inviteLocation,

                    dto,

                    username,

                    password,

                });


            }

            await queryRunner.commitTransaction();

            return {
                success: true,
                message: 'Applicants moved to Screening stage successfully.',
            };

        } catch (error) {

            await queryRunner.rollbackTransaction();

            console.error(
                'Screening Stage Error:',
                error,
            );


            throw new InternalServerErrorException({

                success: false,

                message:
                    'Unable to complete screening process.',

                error_code:
                    'OPERATION_FAILED',

                // Exact database/system error
                error_detail:
                    error.message ?? 'Unknown error',

                // Show file + line number
                error_location:
                    error.stack
                        ? error.stack.split('\n')[1]?.trim()
                        : null,

                // Full stack only development
                stack:
                    process.env.NODE_ENV === 'development'
                        ? error.stack
                        : undefined,

            });

        } finally {

            await queryRunner.release();

        }
    }


    async interiewStage(
        jobId: number,
        dto: InterviewStageDto,
        user: Users,
    ) {

        const interviewDto: InterviewStageDto = {
            stage_id: dto.stage_id,
            applicant_id: dto.applicant_id,
            interview_type: dto.interview_type,
            interviewer: dto.interviewer,
            interviewer_participant: dto.interviewer_participant,

            region_id: dto.region_id,
            address: dto.address,
            invite_date: dto.invite_date,
            message_body: dto.message_body,
            duration_test: dto.duration_test,
            online_link: dto.online_link,
        };

        return this.interviewStage.execute(
            jobId,
            interviewDto,
            user,
        );
    }

    async selectionStages(
        jobId: number,
        dto: SelectionStageDto,
        user: Users,
    ) {

        const selectionDto: SelectionStageDto = {
            stage_id: dto.stage_id,
            applicant_id: dto.applicant_id,
            message_body: dto.message_body,

        };

        return this.selectionStageHandler.execute(
            jobId,
            selectionDto,
            user,
        );
    }

    async BackgrounCheckStages(
        jobId: number,
        dto: BackgroundChecktageDto,
        user: Users,
    ) {

        const backgroundDto: BackgroundChecktageDto = {
            stage_id: dto.stage_id,
            applicant_id: dto.applicant_id,
            message_body: dto.message_body,

        };

        return this.backgrounCheckStageHandler.execute(
            jobId,
            backgroundDto,
            user,
        );
    }

    async OfferStages(
        jobId: number,
        dto: OfferDto,
        user: Users,
    ) {

        const OfferDto: OfferDto = {
            stage_id: dto.stage_id,
            applicant_id: dto.applicant_id,
            message_body: dto.message_body,

        };

        return this.offerStageHandler.execute(
            jobId,
            OfferDto,
            user,
        );
    }
    async EmployedStages(
        jobId: number,
        dto: EmployedDto,
        user: Users,
    ) {

        const employedDto: EmployedDto = {
            stage_id: dto.stage_id,
            applicant_id: dto.applicant_id,
            message_body: dto.message_body,

        };

        return this.employedStageHandler.execute(
            jobId,
            employedDto,
            user,
        );
    }






    private async sendShortListEmail(data: any) {

        const {
            applicant,
            job,
            stage,
            inviteLocation,
            dto
        } = data;

        const positionName =
            dto.position_name ??
            job.position?.position_name ??
            job.position_name ??
            '';

        const templateData = {

            subject:
                `Shortlisted: ${positionName} Application Update`,

            email:
                applicant.user.email,

            first_name:
                applicant.first_name,

            last_name:
                applicant.last_name,

            position_name:
                positionName,

            client_name:
                job.client?.client_name ?? '',

            stage_name:
                stage.stage_name,

            address:
                dto.address ?? '',

            invite_date:
                dto.invite_date ?? '',

            message_body:
                dto.message_body ?? '',

            region_name:
                inviteLocation?.region_name ?? '',

            country:
                inviteLocation?.country?.name ?? '',


            // add this if template uses it
            job_details: job,
            phone_number: job?.ClientPhone?.phone_number ?? '',


        };


        const templatePath = path.join(

            process.cwd(),
            'src',
            'mail',
            'templates',
            'recruitment',
            'invite.template.html'

        );


        const source =
            fs.readFileSync(
                templatePath,
                'utf8'
            );


        // Register helpers
        Handlebars.registerHelper(
            'eq',
            (a, b) => a === b
        );

        // Compile template
        const template = Handlebars.compile(source);

        const html = template(templateData);

        await this.mailService.sendMail({

            from:
                `"${process.env.MAIL_FROM_NAME}" <${process.env.MAIL_FROM_ADDRESS}>`,

            to:
                templateData.email,

            subject:
                templateData.subject,

            html,

        });

    }
    private async sendScreeningEmail({
        applicant,
        job,
        stage,
        inviteLocation,
        dto,
        username,
        password,
    }: {
        applicant: any;
        job: any;
        stage: any;
        inviteLocation: any;
        dto: any;
        username: string;
        password: string;
    }) {

        const templateData = {

            subject:
                `Invitation to aptitude: ${job.position?.position_name} Application`,

            email:
                applicant.user?.email ?? '',

            first_name:
                applicant.first_name ?? '',

            last_name:
                applicant.last_name ?? '',

            position_name:
                job.position?.position_name ?? '',

            client_name:
                job.client?.client_name ?? '',

            phone:
                job.client?.phones?.[0]?.phone_number ?? '',

            stage_name:
                stage.stage_name ?? '',

            // ============================
            // Interview/Test Location
            // ============================

            location:
                inviteLocation?.region_name ?? '',

            country:
                inviteLocation?.country?.country_name ?? '',

            // ============================
            // Test Information
            // ============================

            test_date:
                dto.test_date ?? '',

            test_date_formatted:
                dto.test_date
                    ? new Date(dto.test_date)
                        .toLocaleDateString(
                            'en-GB',
                            {
                                day: '2-digit',
                                month: 'long',
                                year: 'numeric',
                            },
                        )
                    : '',

            test_time:
                dto.test_date
                    ? new Date(dto.test_date)
                        .toLocaleTimeString(
                            'en-GB',
                            {
                                hour: '2-digit',
                                minute: '2-digit',
                            },
                        )
                    : '',

            test_duration:
                dto.test_duration ?? '',

            test_deadline:
                dto.test_deadline ?? '',

            test_deadline_formatted:
                dto.test_deadline
                    ? new Date(dto.test_deadline)
                        .toLocaleDateString(
                            'en-GB',
                            {
                                day: '2-digit',
                                month: 'long',
                                year: 'numeric',
                            },
                        )
                    : '',

            // ============================
            // Generated Credentials
            // ============================

            user_name:
                username,

            user_password:
                password,

            // ============================
            // Test Link
            // ============================

            test_link:
                dto.test_link ??
                process.env.TEST_URL ??
                '',

            // ============================
            // Job Information
            // ============================

            job_details:
                job,

            company_name:
                process.env.APP_NAME ??
                'eKazi',

            support_email:
                process.env.MAIL_FROM_ADDRESS,

        };



        // =====================================
        // Email Template
        // =====================================

        const templatePath = path.join(

            process.cwd(),

            'src',

            'mail',

            'templates',

            'recruitment',

            'invite.template.html',

        );



        const source =
            fs.readFileSync(
                templatePath,
                'utf8',
            );



        Handlebars.registerHelper(

            'eq',

            (a, b) => a === b,

        );



        Handlebars.registerHelper(

            'formatDate',

            (value) => {

                if (!value) return '';

                return new Date(value)
                    .toLocaleDateString('en-GB');

            },

        );



        const template =
            Handlebars.compile(
                source,
            );



        const html =
            template(
                templateData,
            );



        try {


            await this.mailService.sendMail({

                from:

                    `"${process.env.MAIL_FROM_NAME}" <${process.env.MAIL_FROM_ADDRESS}>`,


                to:

                    templateData.email,


                subject:

                    templateData.subject,


                html,

            });



            this.logger.log(

                `Screening email sent to ${templateData.email}`,

            );



        }
        catch (error) {


            this.logger.error(

                `Failed to send screening email to ${templateData.email}`,

                error.stack,

            );


            throw error;

        }

    }
    // private async sendScreeningEmail(data: any) {

    //     const {
    //         applicant,
    //         job,
    //         stage,
    //         inviteLocation,
    //         dto,
    //     } = data;

    //     const templateData = {

    //         subject:
    //             `Invitation to aptitude: ${job.position?.position_name} Application`,

    //         email:
    //             applicant.user.email,

    //         first_name:
    //             applicant.first_name,

    //         last_name:
    //             applicant.last_name,

    //         position_name:
    //             job.position?.position_name ?? '',

    //         client_name:
    //             job.client?.client_name ?? '',

    //         phone:
    //             job.client?.phones?.[0]?.phone_number ?? '',

    //         stage_name:
    //             stage.stage_name,


    //         test_date:
    //             dto.test_date ?? '',

    //         test_date_formatted:
    //             dto.test_date
    //                 ? new Date(dto.test_date)
    //                     .toLocaleDateString('en-GB')
    //                 : '',


    //         test_duration:
    //             dto.test_duration ?? '',


    //         test_deadline:
    //             dto.test_deadline ?? '',


    //         test_deadline_formatted:
    //             dto.test_deadline
    //                 ? new Date(dto.test_deadline)
    //                     .toLocaleDateString('en-GB')
    //                 : '',


    //         user_name:
    //             dto.user_name ?? '',


    //         user_password:
    //             dto.user_password ?? '',


    //         test_link:
    //             dto.test_link ?? '',


    //         job_details:
    //             job,
    //     };

    //     const templatePath = path.join(

    //         process.cwd(),

    //         'src',
    //         'mail',
    //         'templates',
    //         'recruitment',
    //         'invite.template.html'

    //     );

    //     const source =
    //         fs.readFileSync(
    //             templatePath,
    //             'utf8'
    //         );

    //     // Register helpers
    //     Handlebars.registerHelper(
    //         'eq',
    //         (a, b) => a === b
    //     );

    //     // Compile template
    //     const template = Handlebars.compile(source);

    //     const html = template(templateData);

    //     try {

    //         await this.mailService.sendMail({

    //             from:
    //                 `"${process.env.MAIL_FROM_NAME}" <${process.env.MAIL_FROM_ADDRESS}>`,

    //             to:
    //                 templateData.email,

    //             subject:
    //                 templateData.subject,

    //             html,

    //         });


    //     } catch (error) {

    //         console.error(
    //             'EMAIL ERROR:',
    //             error
    //         );

    //         throw error;

    //     }
    // }
    private async generateUniqueUsername(
        email: string,
    ): Promise<string> {

        const baseUsername = email
            .split('@')[0]
            .toLowerCase()
            .replace(/[^a-z0-9._]/g, '');

        let username = baseUsername;
        let counter = 1;

        while (true) {

            const exists = await this.usersRepository.findOne({
                where: {
                    username,
                },
            });

            if (!exists) {
                return username;
            }

            username = `${baseUsername}${counter}`;
            counter++;
        }
    }


    private generatePassword(): string {
        const chars =
            'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$';

        let password = '';

        for (let i = 0; i < 10; i++) {
            password += chars.charAt(
                Math.floor(Math.random() * chars.length)
            );
        }

        return password;
    }
    private async createMoodleUser(
        applicant,
        username: string,
        password: string,
    ) {

        const existingUser =
            await this.moodleUserRepository.findOne({
                where: {
                    email: applicant.user.email,
                },
            });


        if (existingUser) {

            existingUser.username = username;

            existingUser.password = password;

            return await this.moodleUserRepository.save(
                existingUser
            );

        }


        const moodleUser =
            this.moodleUserRepository.create({

                firstname:
                    applicant.first_name,

                lastname:
                    applicant.last_name,
                    
                 middlename: applicant.middle_name,   

                email:
                    applicant.user.email,

                username,

                password,

                confirmed: 1,

                mnethostid: 1,

            });


        return await this.moodleUserRepository.save(
            moodleUser
        );
    }

}