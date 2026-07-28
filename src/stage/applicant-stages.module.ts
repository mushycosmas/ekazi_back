import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ApplicantStagesController } from './applicant-stages.controller';
import { ApplicantStagesService } from './applicant-stages.service';

import { Stage } from 'src/entities/stage.entity';
import { Jobs } from 'src/jobs/entities/job.entity';
import { JobStage } from 'src/jobs/entities/job-stage.entity';
import { ApplicantApplication } from 'src/entities/applicants/applicant-applicantions.entity';
import { Regions } from 'src/entities/regions.entity';

 

import { MailService } from 'src/mail/mail.service';
import { Users } from 'src/entities/users.entity';
import { PersonalAccessToken } from 'src/entities/personal-access-token.entity';
import { Applicants } from 'src/entities/applicants/applicants.entity';
import { JobTestResult } from 'src/jobs/entities/job-test-results.entity';
import { ApplicantListing } from 'src/entities/applicants/applicant-listings.entity';
import { InterviewStage } from './stages/interview.stage';
import { ClientStaff } from 'src/client/entities/client-staff.entity';
import { InterviewType } from 'src/jobs/entities/interview/interview-type.entity';
import { InterviewPanel } from 'src/jobs/entities/interview/interview-panel.entity';
import { InterviewAction } from 'src/jobs/entities/interview/interview-action.entity';
import { InterviewPanelComment } from 'src/jobs/entities/interview/interview-panel-comment.entity';
import { Clients } from 'src/client/clients.entity';
import { InterviewParticipantEmail } from 'src/jobs/entities/interview/interview-participant-email.entity';
import { SelectionStage } from './stages/selection.stage';
import { BackgroundCheckStage } from './stages/backbground-check.stage';
import { OfferStage } from './stages/offer.stage';
import { EmployedStage } from './stages/employed.stage';
import { MoodleUser } from 'src/entities/moodle-user.entity';


@Module({

    imports: [
        TypeOrmModule.forFeature([
            Stage,
            Jobs,
            JobStage,
            ApplicantApplication,
            Applicants,
            Regions,
            Users,
            PersonalAccessToken,
            JobTestResult,
            ApplicantListing,
            ClientStaff,
            InterviewType,
            InterviewPanel,
            InterviewAction,
            InterviewPanelComment,
            Clients,
            InterviewParticipantEmail,
            


        ]),
            // Moodle database repository
        TypeOrmModule.forFeature(
            [
                MoodleUser
            ],
            'second_db'
        ),
        
    ],

    controllers: [ApplicantStagesController],

    providers: [
        ApplicantStagesService,
        MailService,
        InterviewStage,
        SelectionStage,
        BackgroundCheckStage,
        OfferStage,
        EmployedStage,

    ],

    exports: [

        ApplicantStagesService
    ]


})
export class ApplicantStagesModule { }