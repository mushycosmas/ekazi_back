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
import { InterviewPanelComment } from 'src/jobs/entities/interview/interview-panel-comment.entity';
import { InterviewStageRound } from 'src/jobs/entities/interview/interview-stage-round.entity';
import { Users } from 'src/entities/users.entity';
import { MailService } from 'src/mail/mail.service';
import { Regions } from 'src/entities/regions.entity';
import { Applicants } from 'src/entities/applicants/applicants.entity';
import { ClientStaff } from 'src/client/entities/client-staff.entity';
import { InterviewType } from 'src/jobs/entities/interview/interview-type.entity';
import { InterviewStageDto } from '../dto/bulk-interview.dto';
import { Clients } from 'src/client/clients.entity';
import { InterviewPanel } from 'src/jobs/entities/interview/interview-panel.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { InterviewParticipantEmail } from 'src/jobs/entities/interview/interview-participant-email.entity';

@Injectable()
export class InterviewStage {

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

        @InjectRepository(InterviewType)
        private readonly interviewTypeRepository: Repository<InterviewType>,

        @InjectRepository(ClientStaff)
        private readonly clientStaffRepository: Repository<ClientStaff>,

        @InjectRepository(Clients)
        private readonly clientRepository: Repository<Clients>,

        @InjectRepository(InterviewParticipantEmail)
        private readonly interviewParticipantRepository: Repository<InterviewParticipantEmail>,
    ) { }

    async execute(
        jobId: number,
        dto: InterviewStageDto,
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

            // ============================
            // Location
            // ============================
            const inviteLocation =
                await this.regionRepository.findOne({

                    where: {
                        id: dto.region_id
                    },

                    relations: [
                        'country'
                    ]

                });

            // ============================
            // Interview Type
            // ============================
            const interviewType =
                await this.interviewTypeRepository.findOne({

                    where: {
                        id: dto.interview_type
                    }

                });




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
                // Interview Round
                // ============================

                const lastRound =
                    await queryRunner.manager.findOne(

                        InterviewStageRound,

                        {

                            where: {

                                job_id: jobId,

                                applicant_id: applicantId

                            },

                            order: {
                                id: 'DESC'
                            }

                        }

                    );

                const round =
                    lastRound
                        ?
                        lastRound.round + 1
                        :
                        1;

                const interviewRound =
                    queryRunner.manager.create(

                        InterviewStageRound,

                        {

                            job_stage_id:
                                jobStage.id,

                            job_id:
                                jobId,

                            applicant_id:
                                applicantId,

                            round,

                            creator_id:
                                user.id

                        }

                    );

                await queryRunner.manager.save(
                    interviewRound
                );

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
                // Interview Panel
                // ============================

                for (
                    const interviewer of dto.interviewer ?? []
                ) {
                    const panel =
                        queryRunner.manager.create(

                            InterviewPanel,

                            {

                                job_id: jobId,

                                client_staff_id: interviewer,

                                applicant_id: applicantId,
                                creator_id: user.id

                            }

                        );

                    await queryRunner.manager.save(
                        panel
                    );

                }

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

                if (applicant && applicant.user) {

                    const positionName =
                        dto.position_name ??
                        job.position?.position_name ??
                        // job.position_name ??
                        '';

                    // ============================
                    // Send Interview Email to Applicant
                    // ============================
                    await this.sendInterviewEmail({
                        inviteLocation,
                        applicant,
                        job,
                        jobClient,
                        stage,
                        interviewType,
                        dto,
                        // positionName,
                        round
                    });
                }

                // ============================
                // Send Internal Interviewer Emails
                // ============================
                // ============================
                // Send Internal Interviewer Emails
                // ============================
                if (dto.interviewer && dto.interviewer.length > 0) {

                    for (const interviewerId of dto.interviewer) {

                        const clientStaff =
                            await this.clientStaffRepository.findOne({
                                where: {
                                    id: interviewerId
                                },
                                relations: [
                                    'user'
                                ],
                            });


                        if (!clientStaff || !clientStaff.user) {
                            continue;
                        }


                        await this.sendInternalInterviewerEmail({

                            clientStaff,

                            applicant,

                            job,

                            stage,

                            interviewType,

                            dto,

                            inviteLocation,

                            round

                        });

                    }
                }

                // ============================
                // Send External Interviewer Emails
                // ============================
                if (
                    dto.interviewer_participant &&
                    dto.interviewer_participant.length > 0
                ) {
                    for (const email of dto.interviewer_participant) {

                        const participant =
                            await this.interviewParticipantRepository.findOne({
                                where: {
                                    client_id: job.client_id,
                                    email: email.trim().toLowerCase(),
                                },
                            });

                        let externalParticipant = participant;

                        // Save if not exists
                        if (!externalParticipant) {
                            externalParticipant =
                                this.interviewParticipantRepository.create({
                                    client_id: job.client_id,
                                    email: email.trim().toLowerCase(),
                                    online_link: dto.online_link,
                                });

                            externalParticipant =
                                await this.interviewParticipantRepository.save(
                                    externalParticipant,
                                );
                        }

                        await this.sendExternalInterviewerEmail({
                            externalParticipant,
                            applicant,
                            job,
                            stage,
                            interviewType,
                            dto,
                            inviteLocation,
                            round
                        });
                    }
                }
            }

            await queryRunner.commitTransaction();
            return {
                success: true,
                message:
                    "Applicants moved to Interview successfully"

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

    // ============================
    // Send Interview Email to Applicant
    // ============================
    private async sendInterviewEmail({
        applicant,
        job,
        jobClient,
        stage,
        interviewType,
        inviteLocation,
        dto,
        round,
    }: {
        applicant: any;
        job: any;
        jobClient: any;
        stage: any;
        interviewType: any;
        inviteLocation: any;
        dto: any;
        round: number;
    }) {


        const templateData = {

            subject:
                `Interview Invitation - ${job.position?.position_name ?? ''}`,


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
            // Interview Location
            // ============================

            location:
                inviteLocation?.region_name ?? '',


            country:
                inviteLocation?.country?.country_name ?? '',


            address:
                dto.address ?? '',


            // ============================
            // Interview Information
            // ============================

            interview_type:
                interviewType?.name ?? 'Interview',


            interview_round:
                `Round ${round}`,


            invite_date:
                dto.invite_date ?? '',


            invite_date_formatted:
                dto.invite_date
                    ? new Date(dto.invite_date)
                        .toLocaleDateString(
                            'en-GB',
                            {
                                day: '2-digit',
                                month: 'long',
                                year: 'numeric',
                            },
                        )
                    : '',


            invite_time:
                dto.invite_date
                    ? new Date(dto.invite_date)
                        .toLocaleTimeString(
                            'en-GB',
                            {
                                hour: '2-digit',
                                minute: '2-digit',
                            },
                        )
                    : '',


            duration:
                dto.duration_test ??
                dto.test_duration ??
                '',


            message_body:
                dto.message_body ?? '',


            online_link:
                dto.online_link ?? '',


            // ============================
            // Company Information
            // ============================

            client_email:
                jobClient?.user?.email ?? '',


            company_name:
                process.env.APP_NAME ?? 'eKazi',


            support_email:
                process.env.MAIL_FROM_ADDRESS,


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
                'utf8',
            );



        Handlebars.registerHelper(
            'eq',
            (a, b) => a === b,
        );


        Handlebars.registerHelper(
            'formatDate',
            (value) => {

                if (!value)
                    return '';

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



            console.log(
                `Applicant interview email sent to ${templateData.email}`
            );


        }
        catch (error) {

            console.error(
                `Failed sending applicant interview email ${templateData.email}`,
                error,
            );

            throw error;

        }

    }

    // ============================
    // Send Internal Interviewer Email
    // ============================
    private async sendInternalInterviewerEmail({
        clientStaff,
        applicant,
        job,
        stage,
        interviewType,
        dto,
        inviteLocation,
        round,
    }: {
        clientStaff: ClientStaff;
        applicant: any;
        job: any;
        stage: any;
        interviewType: any;
        dto: any;
        inviteLocation: any;
        round: number;
    }) {


        const templateData = {

            subject:
                `Invitation for Interview Participation - ${job.position?.position_name ?? ''}`,


            email:
                clientStaff.user?.email ?? '',


            first_name:
                clientStaff?.first_name ?? '',


            last_name:
                clientStaff?.last_name ?? '',


            position_name:
                job.position?.position_name ?? '',


            client_name:
                job.client?.client_name ?? '',


            phone:
                job.client?.phones?.[0]?.phone_number ?? '',





            stage_name:
                stage.stage_name ?? '',


            applicant_name:
                applicant
                    ? `${applicant.first_name} ${applicant.last_name}`
                    : '',


            // ============================
            // Interview Information
            // ============================

            interview_type:
                interviewType?.name ?? 'Interview',


            interview_round:
                `Round ${round}`,


            invite_date:
                dto.invite_date ?? '',


            invite_date_formatted:
                dto.invite_date
                    ? new Date(dto.invite_date)
                        .toLocaleDateString(
                            'en-GB',
                            {
                                day: '2-digit',
                                month: 'long',
                                year: 'numeric',
                            },
                        )
                    : '',


            invite_time:
                dto.invite_date
                    ? new Date(dto.invite_date)
                        .toLocaleTimeString(
                            'en-GB',
                            {
                                hour: '2-digit',
                                minute: '2-digit',
                            },
                        )
                    : '',


            duration:
                dto.duration_test ??
                dto.test_duration ??
                '',


            address:
                dto.address ?? '',


            location:
                inviteLocation?.region_name ?? '',


            country:
                inviteLocation?.country?.country_name ?? '',


            message_body:
                dto.message_body ?? '',


            online_link:
                dto.online_link ?? '',


            job_details:
                job,


            company_name:
                process.env.APP_NAME ?? 'eKazi',


            support_email:
                process.env.MAIL_FROM_ADDRESS,

        };



        const templatePath = path.join(

            process.cwd(),
            'src',
            'mail',
            'templates',
            'recruitment',
            'internal-invite.template.html'

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

                if (!value)
                    return '';

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



            console.log(
                `Internal interview email sent to ${templateData.email}`
            );


        }
        catch (error) {

            console.error(
                `Failed sending internal interview email ${templateData.email}`,
                error,
            );

            throw error;

        }

    }

    // ============================
    // Send External Interviewer Email
    // ============================
    private async sendExternalInterviewerEmail({
        externalParticipant,
        applicant,
        job,
        stage,
        interviewType,
        dto,
        inviteLocation,
        round,
    }: {
        externalParticipant: InterviewParticipantEmail;
        applicant: any;
        job: any;
        stage: any;
        interviewType: any;
        dto: any;
        inviteLocation: any;
        round: number;
    }) {


        const templateData = {

            subject:
                `Invitation for Interview Participation - ${job.position?.position_name ?? ''}`,


            email:
                externalParticipant.email,


            first_name:
                externalParticipant.email.split('@')[0] ?? 'External Participant',


            last_name:
                '',


            position_name:
                job.position?.position_name ?? '',


            client_name:
                job.client?.client_name ?? '',


            phone:
                job.client?.phones?.[0]?.phone_number ?? '',


            stage_name:
                stage.stage_name ?? '',


            applicant_name:
                applicant
                    ? `${applicant.first_name} ${applicant.last_name}`
                    : '',


            // ============================
            // Interview Information
            // ============================

            interview_type:
                interviewType?.name ?? 'Interview',


            interview_round:
                `Round ${round}`,


            invite_date:
                dto.invite_date ?? '',


            invite_date_formatted:
                dto.invite_date
                    ? new Date(dto.invite_date)
                        .toLocaleDateString(
                            'en-GB',
                            {
                                day: '2-digit',
                                month: 'long',
                                year: 'numeric',
                            },
                        )
                    : '',


            invite_time:
                dto.invite_date
                    ? new Date(dto.invite_date)
                        .toLocaleTimeString(
                            'en-GB',
                            {
                                hour: '2-digit',
                                minute: '2-digit',
                            },
                        )
                    : '',


            duration:
                dto.duration_test ??
                dto.test_duration ??
                '',


            address:
                dto.address ?? '',


            location:
                inviteLocation?.region_name ?? '',


            country:
                inviteLocation?.country?.country_name ?? '',


            message_body:
                dto.message_body ?? '',


            online_link:
                dto.online_link ??
                externalParticipant.online_link ??
                '',


            job_details:
                job,


            company_name:
                process.env.APP_NAME ?? 'eKazi',


            support_email:
                process.env.MAIL_FROM_ADDRESS,

        };



        const templatePath = path.join(

            process.cwd(),

            'src',

            'mail',

            'templates',
            'recruitment',
            'external-invite.template.html'

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

                if (!value)
                    return '';

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
                subject: templateData.subject,
                html,

            });
            console.log(
                `External interview email sent to ${templateData.email}`
            );


        }
        catch (error) {

            console.error(
                `Failed sending external interview email ${templateData.email}`,
                error,
            );

            throw error;

        }

    }

    // ============================
    // Helper: Send Email with Template
    // ============================
    private async sendEmailWithTemplate(
        templateName: string,
        templateData: any,
        to: string,
        subject: string
    ) {
        try {
            let templatePath = path.join(
                process.cwd(),
                'src',
                'mail',
                'templates',
                `${templateName}.template.html`
            );

            // Try alternative path if file not found
            let source: string;
            try {
                source = fs.readFileSync(templatePath, 'utf8');
            } catch (err) {
                // Try without the subfolder
                templatePath = path.join(
                    process.cwd(),
                    'src',
                    'mail',
                    'templates',
                    `${templateName.split('/').pop()}.template.html`
                );
                try {
                    source = fs.readFileSync(templatePath, 'utf8');
                } catch (err2) {
                    // Fallback template
                    source = this.getFallbackTemplate(templateName, templateData);
                }
            }

            // Register helpers
            Handlebars.registerHelper('eq', (a, b) => a === b);
            Handlebars.registerHelper('ucwords', (str) => {
                if (!str) return '';
                return str.replace(/\b\w/g, l => l.toUpperCase());
            });

            // Compile template
            const template = Handlebars.compile(source);
            const html = template(templateData);

            await this.mailService.sendMail({
                from: `"${process.env.MAIL_FROM_NAME || 'eKazi.co.tz'}" <${process.env.MAIL_FROM_ADDRESS || 'no-reply@ekazi.co.tz'}>`,
                to: to,
                subject: subject,
                html: html,
            });

        } catch (error) {
            console.error(`Failed to send email to ${to}:`, error);
            // Don't throw - email failure shouldn't break the whole process
        }
    }

    // ============================
    // Fallback Templates
    // ============================
    private getFallbackTemplate(templateName: string, data: any): string {
        const baseTemplate = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>{{subject}}</title>
        </head>
        <body>
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2>{{subject}}</h2>
                <p>Hello {{first_name}} {{last_name}},</p>
                <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 15px 0;">
                    <p><strong>Position:</strong> {{position_name}}</p>
                    <p><strong>Client:</strong> {{client_name}}</p>
                    <p><strong>Stage:</strong> {{stage_name}}</p>
                    {{#if invite_date}}<p><strong>Date:</strong> {{invite_date}}</p>{{/if}}
                    {{#if address}}<p><strong>Address:</strong> {{address}}</p>{{/if}}
                    {{#if interview_type}}<p><strong>Interview Type:</strong> {{interview_type}}</p>{{/if}}
                    {{#if interview_round}}<p><strong>Round:</strong> {{interview_round}}</p>{{/if}}
                    {{#if duration}}<p><strong>Duration:</strong> {{duration}}</p>{{/if}}
                </div>
                <div>{{{message_body}}}</div>
                <hr>
                <p style="color: #666; font-size: 12px;">This is an automated message from eKazi.co.tz</p>
            </div>
        </body>
        </html>
        `;

        // Customize based on template type
        if (templateName.includes('internal_invite')) {
            return baseTemplate.replace(
                '</div>',
                `<p><strong>Applicant:</strong> {{applicant_name}}</p></div>`
            );
        }

        if (templateName.includes('external_invite')) {
            return baseTemplate.replace(
                '</div>',
                `<p><strong>Applicant:</strong> {{applicant_name}}</p>
                {{#if online_link}}<p><strong>Join Link:</strong> <a href="{{online_link}}">{{online_link}}</a></p>{{/if}}
                </div>`
            );
        }

        return baseTemplate;
    }

}