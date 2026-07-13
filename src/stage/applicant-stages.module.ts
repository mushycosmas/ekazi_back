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
        ])],

    controllers: [ApplicantStagesController],

    providers: [
        ApplicantStagesService,
        MailService

    ],

    exports: [

        ApplicantStagesService
    ]


})
export class ApplicantStagesModule { }