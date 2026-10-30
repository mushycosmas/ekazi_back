
import {
    BadRequestException,
    ConflictException,
    Injectable,
    InternalServerErrorException,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { Jobs } from '../jobs/entities/job.entity';
import { JobStage } from '../jobs/entities/job-stage.entity';

import { Applicants } from '../entities/applicants/applicants.entity';
import { ApplicantApplication } from '../entities/applicants/applicant-applicantions.entity';
import { ApplicantListing } from '../entities/applicants/applicant-listings.entity';
import { Stage } from '../entities/stage.entity';
import { Users } from '../entities/users.entity';

import { ApplicationsEmailService } from './applications-email.service';
import { JobApplicationModals } from '../jobs/entities/job-application-modals.entity';
import { ApplyJobDto } from './dto/apply-job.dto';
import { Notification } from 'src/client/entities/notifications.entity';
import { CreateNonUserApplicationDto } from './dto/create-non-user-application.dto';
import { NonUserApplication } from 'src/entities/applicants/non-user-application.entity';
import { NonUserApplicationFile } from 'src/entities/applicants/non-user-application-file.entity';
import { unlink } from 'fs/promises';
import * as fs from 'fs';
import * as path from 'path';
import * as Handlebars from 'handlebars';
import { MailService } from 'src/mail/mail.service';

// Use your existing mail service import and injection.


@Injectable()
export class ApplicationsService {
    constructor(
        private readonly dataSource: DataSource,

        @InjectRepository(Jobs)
        private readonly jobsRepo: Repository<Jobs>,

        @InjectRepository(Applicants)
        private readonly applicantsRepo: Repository<Applicants>,

        @InjectRepository(Users)
        private readonly usersRepo: Repository<Users>,

        @InjectRepository(ApplicantApplication)
        private readonly applicationsRepo: Repository<ApplicantApplication>,

        @InjectRepository(NonUserApplication)
        private readonly nonUserApplicationsRepo: Repository<NonUserApplication>,

        private readonly mailerService: MailService,


        @InjectRepository(Stage)
        private readonly stagesRepo: Repository<Stage>,

        private readonly applicationsEmailService: ApplicationsEmailService,
    ) { }

    /**
     * Submit an application using the method configured for the job.
     *
     * Supported methods:
     * - internal
     * - email
     * - external_url
     */

    async applyInternal(
        jobId: number,
        userId: number,
        dto: ApplyJobDto,
    ) {
        // 1. Validate application notes
        if (!dto.notes?.trim()) {
            throw new BadRequestException({
                error: { notes: ['The notes field is required.'] },
            });
        }

        // 2. Find authenticated user
        const user = await this.usersRepo.findOne({
            where: { id: userId },
        });

        if (!user) {
            throw new NotFoundException('User not found.');
        }

        // 3. Find applicant profile using authenticated user ID
        const applicant = await this.applicantsRepo.findOne({
            where: { user_id: user.id },
        });

        if (!applicant) {
            throw new NotFoundException('Applicant profile not found.');
        }

        // 4. Find job
        const job = await this.jobsRepo.findOne({
            where: { id: jobId },
        });

        if (!job) {
            throw new NotFoundException('Job not found.');
        }

        // 5. Verify that this job supports internal applications
        // const internalConfiguration =
        //     await this.dataSource
        //         .getRepository(JobApplicationModals)
        //         .findOne({
        //             where: {
        //                 job_id: job.id,
        //                 status: 'internal',
        //             },
        //         });

        // if (!internalConfiguration) {
        //     throw new BadRequestException(
        //         'This job is not configured for internal applications.',
        //     );
        // }

        // 6. Find initial application stage
        const initialStage = await this.stagesRepo.findOne({
            where: { stage_number: 1 },
        });

        if (!initialStage) {
            throw new InternalServerErrorException(
                'The initial application stage is not configured.',
            );
        }

        const queryRunner = this.dataSource.createQueryRunner();

        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            // 7. Prevent duplicate applications
            const existingApplication =
                await queryRunner.manager.findOne(
                    ApplicantApplication,
                    {
                        where: {
                            applicant_id: applicant.id,
                            job_id: job.id,
                        },
                    },
                );

            if (existingApplication) {
                throw new ConflictException(
                    'Job application failed. Only one application is allowed.',
                );
            }

            // 8. Save application
            const application = queryRunner.manager.create(
                ApplicantApplication,
                {
                    job_id: job.id,
                    applicant_id: applicant.id,
                    letter: dto.notes.trim(),
                    status: 'Applied',
                    stage_id: initialStage.id,
                    hide: 0,

                    // Use the value required by your actual consent workflow.
                    consent_verified: 0,
                },
            );

            const savedApplication =
                await queryRunner.manager.save(application);

            // 9. Notify the employer
            const notification = queryRunner.manager.create(
                Notification,
                {
                    user_id: user.id,
                    applicant_id: applicant.id,
                    user_to_notify: job.client_id,
                    data: 'Job Application',
                    type: 'job-application',
                    job_id: job.id,
                },
            );

            await queryRunner.manager.save(notification);

            // 10. Find or create job stage
            let jobStage = await queryRunner.manager.findOne(
                JobStage,
                {
                    where: {
                        job_id: job.id,
                        applicant_id: applicant.id,
                        stage_id: initialStage.id,
                    },
                },
            );

            if (!jobStage) {
                jobStage = queryRunner.manager.create(JobStage, {
                    job_id: job.id,
                    applicant_id: applicant.id,
                    stage_id: initialStage.id,
                    creator_id: user.id,
                    updator_id: user.id,
                });

                jobStage = await queryRunner.manager.save(jobStage);
            }

            // 11. Create applicant listing
            const existingListing =
                await queryRunner.manager.findOne(
                    ApplicantListing,
                    {
                        where: {
                            job_stage_id: jobStage.id,
                            applicant_id: applicant.id,
                        },
                    },
                );

            if (existingListing) {
                throw new ConflictException(
                    'An applicant listing already exists for this job stage.',
                );
            }

            const listing = queryRunner.manager.create(
                ApplicantListing,
                {
                    // This references JobStage.id, not Stage.id.
                    job_stage_id: jobStage.id,
                    stage_id: initialStage.id,
                    job_id: job.id,
                    applicant_id: applicant.id,
                    application_id: savedApplication.id,
                    created_by: user.id,
                },
            );

            await queryRunner.manager.save(listing);

            // 12. Commit all changes
            await queryRunner.commitTransaction();
            // Send confirmation email to applicant
            const applicantEmail = user.email?.trim();

            let emailSent = false;

            if (applicantEmail) {
                emailSent = await this.sendInternalApplicationEmail({
                    email: applicantEmail,
                    first_name: applicant.first_name,
                    position_name:
                        job.position?.position_name ?? 'Job application',
                });
            }

            return {
                success: true,
                message: 'You have successfully applied for this job.',
                data: {
                    application_id: savedApplication.id,
                    job_id: job.id,
                    applicant_id: applicant.id,
                    status: 'Applied',
                    stage_id: initialStage.id,
                },
            };
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }
    }


    private async sendInternalApplicationEmail(data: {
        email: string;
        first_name: string | null;
        position_name: string;
    }): Promise<boolean> {
        try {
            const templatePath = path.join(
                process.cwd(),
                'src',
                'mail',
                'templates',
                'applications',
                'internal-application.template.html',
            );

            // Read HTML template
            const source = fs.readFileSync(templatePath, 'utf8');

            // Compile Handlebars template
            const template = Handlebars.compile(source);

            // Template variables
            const templateData = {
                first_name: data.first_name,
                position_name: data.position_name,
                year: new Date().getFullYear(),
            };

            const html = template(templateData);

            // Send email
            await this.mailerService.sendMail({
                from: `"${process.env.MAIL_FROM_NAME}" <${process.env.MAIL_FROM_ADDRESS}>`,
                to: data.email,
                subject: `Application Received - ${data.position_name}`,
                html,
            });

            return true;

        } catch (error) {
            console.error(
                'Internal application email error:',
                error,
            );

            return false;
        }
    }



    async applyNonUserByEmail(
        dto: CreateNonUserApplicationDto,
        files: Express.Multer.File[],
    ) {
        if (!dto.first_name?.trim()) {
            throw new BadRequestException('First name is required.');
        }

        if (!dto.last_name?.trim()) {
            throw new BadRequestException('Last name is required.');
        }

        if (!dto.from?.trim()) {
            throw new BadRequestException('Applicant email is required.');
        }

        if (!dto.phone?.trim()) {
            throw new BadRequestException('Phone number is required.');
        }

        if (!dto.notes?.trim()) {
            throw new BadRequestException('Application notes are required.');
        }

        if (!files?.length) {
            throw new BadRequestException(
                'At least one CV or document attachment is required.',
            );
        }

        const email = dto.from.trim().toLowerCase();
        const firstName = dto.first_name.trim();
        const lastName = dto.last_name.trim();
        const fullName = `${firstName} ${lastName}`;

        const job = await this.jobsRepo.findOne({
            where: { id: dto.job_id },
            relations: ['jobEmails', 'position'],
        });

        if (!job) {
            await this.removeNonUserFiles(files);
            throw new NotFoundException('Job not found.');
        }

        // Confirm that this job accepts email applications.
        const emailConfiguration = await this.dataSource
            .getRepository(JobApplicationModals)
            .findOne({
                where: {
                    job_id: job.id,
                    status: 'email',
                },
            });

        if (!emailConfiguration) {
            await this.removeNonUserFiles(files);
            throw new BadRequestException(
                'This job is not configured for email applications.',
            );
        }

        const employerEmail = job.jobEmails?.email?.trim();

        if (!employerEmail) {
            await this.removeNonUserFiles(files);
            throw new BadRequestException(
                'The employer has not configured an application email.',
            );
        }

        const existingApplication =
            await this.nonUserApplicationsRepo.findOne({
                where: {
                    job_id: job.id,
                    applicant_email: email,
                },
            });

        if (existingApplication) {
            await this.removeNonUserFiles(files);
            throw new ConflictException(
                'You have already applied for this job.',
            );
        }

        // Store relative paths in the database.
        const attachmentPaths = files.map(
            (file) => `uploads/non_useremail/${file.filename}`,
        );

        const queryRunner = this.dataSource.createQueryRunner();

        let savedApplication: NonUserApplication;

        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            // Recheck duplicates inside the transaction.
            const duplicate = await queryRunner.manager.findOne(
                NonUserApplication,
                {
                    where: {
                        job_id: job.id,
                        applicant_email: email,
                    },
                },
            );

            if (duplicate) {
                throw new ConflictException(
                    'You have already applied for this job.',
                );
            }

            const application = queryRunner.manager.create(
                NonUserApplication,
                {
                    job_id: job.id,
                    applicant_email: email,
                    phone: dto.phone.trim(),
                    full_name: fullName,
                    application_type: 'Email',
                    note: dto.notes.trim(),
                    // attachment: attachmentPaths[0],
                },
            );

            savedApplication =
                await queryRunner.manager.save(application);

            for (let index = 0; index < files.length; index++) {
                const attachment = queryRunner.manager.create(
                    NonUserApplicationFile,
                    {
                        non_user_application_id: savedApplication.id,
                        file_path: attachmentPaths[index],
                        original_name: files[index].originalname,
                    },
                );

                await queryRunner.manager.save(attachment);
            }

            await queryRunner.commitTransaction();
        } catch (error) {
            if (queryRunner.isTransactionActive) {
                await queryRunner.rollbackTransaction();
            }

            await this.removeNonUserFiles(files);
            throw error;
        } finally {
            await queryRunner.release();
        }

        // Prepare email information.
        const positionName =
            job.position?.position_name ??
            (job as any).position_name ??
            'Job application';

        const applicantEmailSent = await this.sendNonUserApplicationEmail({
            to: email,
            recipientName: fullName,
            positionName,
            applicantName: fullName,
            applicantEmail: email,
            phone: dto.phone.trim(),
            notes: dto.notes.trim(),
            isEmployer: false,
        });

        // Notify the employer and attach the uploaded CV/documents.
        const employerEmailSent = await this.sendNonUserApplicationEmail({
            to: employerEmail,
            recipientName: 'Recruitment Team',
            positionName,
            applicantName: fullName,
            applicantEmail: email,
            phone: dto.phone.trim(),
            notes: dto.notes.trim(),
            isEmployer: true,
            attachments: files.map((file) => ({
                filename: file.originalname,
                path: path.isAbsolute(file.path)
                    ? file.path
                    : path.resolve(process.cwd(), file.path),
            })),
        });

        const emailSent =
            applicantEmailSent && employerEmailSent;

        return {
            success: true,
            message: emailSent
                ? 'Application submitted successfully. Confirmation email sent.'
                : 'Application saved successfully, but one or more emails could not be delivered.',
            data: {
                application_id: savedApplication.id,
                job_id: job.id,
                applicant_name: fullName,
                applicant_email: email,
                application_type: 'Email',
                email_sent: emailSent,
                applicant_confirmation_sent: applicantEmailSent,
                employer_notification_sent: employerEmailSent,
            },
        };
    }

    /**
     * Sends an HTML email using the eKazi application template.
     * Returns false if email delivery fails.
     */
    private async sendNonUserApplicationEmail(data: {
        to: string;
        recipientName: string;
        positionName: string;
        applicantName: string;
        applicantEmail: string;
        phone?: string;
        notes?: string;
        isEmployer: boolean;
        attachments?: Array<{
            filename: string;
            path: string;
        }>;
    }): Promise<boolean> {
        try {
            const {
                to,
                recipientName,
                positionName,
                applicantName,
                applicantEmail,
                phone = '',
                notes = '',
                isEmployer,
                attachments = [],
            } = data;

            const templatePath = path.join(
                process.cwd(),
                'src',
                'mail',
                'templates',
                'applications',
                'non-user-application.template.html',
            );

            const source = fs.readFileSync(templatePath, 'utf8');
            const template = Handlebars.compile(source);

            const templateData = {
                subject: isEmployer
                    ? `New Application: ${positionName}`
                    : `Application Received: ${positionName}`,

                recipient_name: recipientName,
                heading: isEmployer
                    ? 'You Have Received a New Application'
                    : 'Your Application Has Been Received',

                intro_message: isEmployer
                    ? `A new application has been submitted for ${positionName} through eKazi.`
                    : `Thank you for applying through eKazi Portal! We have successfully received your application for the position of ${positionName}.`,

                position_name: positionName,
                applicant_name: applicantName,
                applicant_email: applicantEmail,
                phone,
                notes,
                isEmployer,

                closing_message: isEmployer
                    ? 'Please review the application and attached documents.'
                    : 'Only shortlisted candidates will proceed to the next stage. We appreciate your interest and wish you the best in your job search!',

                year: new Date().getFullYear(),
            };

            const html = template(templateData);

            await this.mailerService.sendMail({
                from: `"${process.env.MAIL_FROM_NAME}" <${process.env.MAIL_FROM_ADDRESS}>`,
                to,
                subject: templateData.subject,
                html,
                ...(attachments.length > 0 ? { attachments } : {}),
            });

            return true;
        } catch (error) {
            // Keep the saved application and files if email delivery fails.
            console.error(
                `Failed to send application email to ${data.to}:`,
                error,
            );

            return false;
        }
    }



    private async removeNonUserFiles(
        files: Express.Multer.File[],
    ): Promise<void> {
        await Promise.all(
            (files ?? []).map(async (file) => {
                try {
                    await unlink(file.path);
                } catch {
                    // Ignore files that are already missing.
                }
            }),
        );
    }



}
