import {
    Injectable,
    NotFoundException,
} from '@nestjs/common';

import * as fs from 'fs';
import * as path from 'path';
import * as Handlebars from 'handlebars';

import { DataSource, Repository } from 'typeorm';

import { Stage } from 'src/entities/stage.entity';
import { Jobs } from 'src/jobs/entities/job.entity';
import { JobStage } from 'src/jobs/entities/job-stage.entity';
import { ApplicantApplication } from 'src/entities/applicants/applicant-applicantions.entity';
import { ApplicantListing } from 'src/entities/applicants/applicant-listings.entity';
import { JobTestResult } from 'src/jobs/entities/job-test-results.entity';
import { Users } from 'src/entities/users.entity';
import { MailService } from 'src/mail/mail.service';
import { Regions } from 'src/entities/regions.entity';
import { Applicants } from 'src/entities/applicants/applicants.entity';
import { Clients } from 'src/client/clients.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { EmployedDto } from '../dto/employed.dto';

 

@Injectable()
export class EmployedStage {

    constructor(
        private readonly dataSource: DataSource,
        private readonly mailService: MailService,
        @InjectRepository(Stage)
        private readonly stageRepository: Repository<Stage>,
        @InjectRepository(Jobs)
        private readonly jobRepository: Repository<Jobs>,
        @InjectRepository(Regions)
        private readonly regionRepository: Repository<Regions>,
        @InjectRepository(Applicants)
        private readonly applicantsRepository: Repository<Applicants>,
        @InjectRepository(Clients)
        private readonly clientRepository: Repository<Clients>,
    ) { }

    async execute(
        jobId: number,
        dto: EmployedDto,
        user: Users,
    ) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            // ============================
            // Stage
            // ============================
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
            // ============================
            // Job
            // ============================
            const job =
                await this.jobRepository.findOne({
                    where: {
                        id: jobId,
                    },
                    relations: [
                        'client',
                        'position'
                    ]

                });

            if (!job) {

                throw new NotFoundException(
                    'Job not found'
                );

            }

            // ============================
            // Get Job Client (for email)
            // ============================
            const jobClient =
                await this.clientRepository.findOne({

                    where: {
                        id: job.client_id
                    },

                    relations: [
                        'user'
                    ]

                });

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

     
 
            for (
                const applicantId of dto.applicant_id
            ) {

                // ============================
                // Get Applicant Application (to get application_id)
                // ============================
                const applicantApplication =
                    await queryRunner.manager.findOne(
                        ApplicantApplication,
                        {
                            where: {
                                job_id: jobId,
                                applicant_id: applicantId
                            }
                        }
                    );

                const applicationId = applicantApplication?.id || applicantId;

                // ============================
                // Job Stage
                // ============================
                let jobStage =
                    await queryRunner.manager.findOne(
                        JobStage,
                        {
                            where: {
                                job_id: jobId,
                                stage_id: dto.stage_id,
                                applicant_id: applicantId
                            }
                        });

                if (!jobStage) {
                    jobStage =
                        queryRunner.manager.create(
                            JobStage,
                            {
                                job_id: jobId,
                                stage_id: dto.stage_id,
                                applicant_id: applicantId,
                                creator_id: user.id,
                                updator_id: user.id

                            });
                    await queryRunner.manager.save(
                        jobStage
                    );
                }
                // ============================
                // Update Application
                // ============================

                await queryRunner.manager.update(

                    ApplicantApplication,

                    {
                        job_id: jobId,
                        applicant_id: applicantId
                    },

                    {
                        stage_id: dto.stage_id,
                        status: stage.stage_name
                    }

                );

                // ============================
                // Applicant Listing History
                // ============================
                const listing =
                    queryRunner.manager.create(

                        ApplicantListing,

                        {

                            job_id: jobId,
                            applicant_id: applicantId,
                            application_id: applicationId, // Use the actual application ID
                            stage_id: dto.stage_id,
                            status: stage.stage_name,
                            hide: 1,
                            creator_id: user.id,
                            updator_id: user.id

                        }

                    );
                await queryRunner.manager.save(
                    listing
                );
                // ============================
                // Test Result
                // ============================
                let test =
                    await queryRunner.manager.findOne(

                        JobTestResult,

                        {
                            where: {

                                job_id: jobId,
                                applicant_id: applicantId

                            }
                        }

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
                    await this.sendEmployedEmail({

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
                    "Applicants moved to Selection successfully"

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
  private async sendEmployedEmail(data: any) {
 
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
                 `Employed: ${positionName} Application Update`,
 
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
 
  
 

}