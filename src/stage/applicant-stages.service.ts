import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

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


@Injectable()
export class ApplicantStagesService {


    constructor(

        private readonly dataSource: DataSource,


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

 async getApplicantsByStage(
    jobId: number,
    stageName: string,
    page: number = 1,
    limit: number = 10,
    search?: string,
) {

    const stage =
        await this.stageRepository.findOne({
            where: {
                stage_name: stageName,
            },
        });


    if (!stage) {
        throw new NotFoundException(
            'Stage not found',
        );
    }


    const query =
        this.jobStageRepository
            .createQueryBuilder('jobStage')
            .leftJoinAndSelect(
                'jobStage.applicant',
                'applicant',
            )
            .leftJoinAndSelect(
                'applicant.user',
                'user',
            )
            .leftJoinAndSelect(
                'jobStage.stage',
                'stage',
            )
            .where(
                'jobStage.job_id = :jobId',
                {
                    jobId,
                },
            )
            .andWhere(
                'jobStage.stage_id = :stageId',
                {
                    stageId: stage.id,
                },
            );


    // SEARCH
    if (search) {

        query.andWhere(
            `
            (
                applicant.first_name LIKE :search
                OR applicant.last_name LIKE :search
                OR user.email LIKE :search
            )
            `,
            {
                search: `%${search}%`,
            },
        );

    }


    const [applicants, total] =
        await query

            .skip(
                (page - 1) * limit,
            )

            .take(limit)

            .orderBy(
                'jobStage.id',
                'DESC',
            )

            .getManyAndCount();

    return {

        success: true,

        message:
            `${stageName} applicants fetched successfully.`,

   

        data: applicants.map(item => ({

            id: item.id,

            job_id: item.job_id,

            stage_id: item.stage_id,

            applicant_id:
                item.applicant_id,

            stage: {

                id:
                    item.stage.id,

                name:
                    item.stage.stage_name,

            },

            applicant: item.applicant ? {
                id:
                    item.applicant.id,

                first_name:
                    item.applicant.first_name,

                last_name:
                    item.applicant.last_name,

                email:
                    item.applicant.user?.email ?? null,

            } : null,

        })),
             pagination: {

            total,

            page,

            limit,

            totalPages:
                Math.ceil(total / limit),

        },

    };
}


    async bulkShortList(
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
                    dto,
                    user
                );

                break;

            case 'Screening':

                await this.screeningStage(dto, user);

                break;

            case 'Interview':

                await this.interViewStage(dto);

                break;

            case 'Selection':

                await this.selectionStage(dto);

                break;

            case 'Background Check':

                await this.backgroundStage(dto);

                break;

            default:

                throw new Error(
                    'Invalid stage selected'
                );

        }

        return true;

    }

    async shortListedStage(
        dto: BulkShortListDto,
        user: Users,
    ) {


        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();

        await queryRunner.startTransaction();

        try {

            const stage =
                await this.stageRepository.findOne({

                    where: {
                        id: dto.stage_id
                    }

                });

            if (!stage) {
                throw new Error(
                    'Stage not found'
                );
            }
            const job = await this.jobRepository.findOne({

                where: {
                    id: dto.job_id
                },

                relations: [
                    'client',
                    'position'
                ]

            });

            if (!job) {
                throw new Error(
                    'Job not found'
                );
            }

            // Update Job Stage

            await queryRunner.manager.update(

                Jobs,

                dto.job_id,

                {

                    stage_id: dto.stage_id

                }

            );

            // Location

            const inviteLocation =
                await this.regionRepository.findOne({

                    where: {
                        id: dto.region_id
                    }

                });
            for (
                const applicantId of dto.applicant_id
            ) {

                // =============================
                // Create Job Stage
                // =============================


                let jobStage =
                    await this.jobStageRepository.findOne({

                        where: {

                            job_id: dto.job_id,
                            stage_id: dto.stage_id,
                            applicant_id: applicantId

                        }

                    });

                if (!jobStage) {

                    jobStage =
                        await queryRunner.manager.save(

                            JobStage,

                            {

                                job_id: dto.job_id,

                                stage_id: dto.stage_id,

                                applicant_id: applicantId,
                                creator_id: job.client.user_id,
                                updator_id: job.client.user_id,

                            }

                        );


                }

                // =============================
                // Update Applicant Application
                // =============================


                await queryRunner.manager.update(

                    ApplicantApplication,

                    {

                        job_id: dto.job_id,

                        applicant_id: applicantId

                    },

                    {

                        stage_id: dto.stage_id,

                        status: stage.stage_name

                    }

                );

                // =============================
                // Get Applicant
                // =============================

                const applicant = await queryRunner.manager
                    .getRepository(Applicants)
                    .createQueryBuilder('applicant')
                    .leftJoin('applicant.user', 'user')
                    .select([
                        'user.email',
                        'applicant.first_name',
                        'applicant.last_name',
                    ])
                    .where('applicant.id = :id', {
                        id: applicantId,
                    })
                    .getOne();

                if (applicant) {
                    await this.sendShortListEmail({

                        applicant,

                        job,

                        stage,

                        inviteLocation,

                        dto

                    });
                }

            }

            await queryRunner.commitTransaction();

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
        dto: BulkScreeningDto,
        user: Users,
    ) {
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
                throw new NotFoundException('Stage not found');
            }

            // ============================
            // Job
            // ============================
            const job = await this.jobRepository.findOne({
                where: { id: dto.job_id },
                relations: [
                    'client',
                    'client.phones',
                    'position',
                ],
            });

            if (!job) {
                throw new NotFoundException('Job not found');
            }

            // ============================
            // Update Job Stage
            // ============================
            await queryRunner.manager.update(
                Jobs,
                dto.job_id,
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
                            job_id: dto.job_id,
                            stage_id: dto.stage_id,
                            applicant_id: applicantId,
                        },
                    });

                if (!jobStage) {
                    jobStage =
                        await queryRunner.manager.save(
                            JobStage,
                            {
                                job_id: dto.job_id,
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
                await queryRunner.manager.update(
                    ApplicantApplication,
                    {
                        job_id: dto.job_id,
                        applicant_id: applicantId,
                    },
                    {
                        stage_id: dto.stage_id,
                        status: stage.stage_name,
                    },
                );

                // ----------------------------
                // Applicant Listing
                // ----------------------------
                let listing =
                    await this.applicantListingRepository.findOne({
                        where: {
                            job_id: dto.job_id,
                            applicant_id: applicantId,
                            stage_id: dto.stage_id,
                        },
                    });

                if (!listing) {
                    listing =
                        this.applicantListingRepository.create({
                            job_id: dto.job_id,
                            applicant_id: applicantId,
                            application_id: applicantId,
                            stage_id: dto.stage_id,
                            status: stage.stage_name,
                            hide: 1,
                        });
                } else {
                    listing.status = stage.stage_name;
                    listing.hide = 1;
                }

                await queryRunner.manager.save(listing);

                // ----------------------------
                // Job Test Result
                // ----------------------------
                let test =
                    await this.jobTestResultRepository.findOne({
                        where: {
                            job_id: dto.job_id,
                            applicant_id: applicantId,
                        },
                    });

                if (!test) {
                    test =
                        this.jobTestResultRepository.create({
                            job_id: dto.job_id,
                            applicant_id: applicantId,
                        });
                }

                test.test_date = dto.test_date
                    ? new Date(dto.test_date)
                    : undefined;
                test.test_duration = dto.test_duration?.toString() ?? '';
                test.test_deadline = dto.test_deadline ?? '';
                test.user_name = dto.user_name ?? '';
                test.user_password = dto.user_password ?? '';
                test.job_stage_id = jobStage.id;
                test.creator_id = user.id;
                test.updator_id = user.id;

                await queryRunner.manager.save(JobTestResult, test);

                // ----------------------------
                // Applicant
                // ----------------------------
                const applicant =
                    await this.applicantsRepository.findOne({
                        where: {
                            id: applicantId,
                        },
                        relations: ['user'],
                    });

                if (applicant) {

                    await this.sendScreeningEmail({
                        applicant,
                        job,
                        stage,
                        inviteLocation,
                        dto,
                    });

                }
            }

            await queryRunner.commitTransaction();

            return {
                success: true,
                message: 'Applicants moved to Screening stage successfully.',
            };

        } catch (error) {

            await queryRunner.rollbackTransaction();

            throw error;

        } finally {

            await queryRunner.release();

        }
    }


    private async interViewStage(
        dto: BulkShortListDto
    ) {

        // Interview logic

    }


    private async backgroundStage(
        dto: BulkShortListDto
    ) {

        // Background Check logic

    }
    private async selectionStage(
        dto: BulkShortListDto
    ) {

        // selectionStage Check logic

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
    private async sendScreeningEmail(data: any) {

        const {
            applicant,
            job,
            stage,
            inviteLocation,
            dto,
        } = data;

        const templateData = {

            subject:
                `Invitation to aptitude: ${job.position?.position_name} Application`,

            email:
                applicant.user.email,

            first_name:
                applicant.first_name,

            last_name:
                applicant.last_name,

            position_name:
                job.position?.position_name ?? '',

            client_name:
                job.client?.client_name ?? '',

            phone:
                job.client?.phones?.[0]?.phone_number ?? '',

            stage_name:
                stage.stage_name,


            test_date:
                dto.test_date ?? '',

            test_date_formatted:
                dto.test_date
                    ? new Date(dto.test_date)
                        .toLocaleDateString('en-GB')
                    : '',


            test_duration:
                dto.test_duration ?? '',


            test_deadline:
                dto.test_deadline ?? '',


            test_deadline_formatted:
                dto.test_deadline
                    ? new Date(dto.test_deadline)
                        .toLocaleDateString('en-GB')
                    : '',


            user_name:
                dto.user_name ?? '',


            user_password:
                dto.user_password ?? '',


            test_link:
                dto.test_link ?? '',


            job_details:
                job,
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


        } catch (error) {

            console.error(
                'EMAIL ERROR:',
                error
            );

            throw error;

        }
    }


}