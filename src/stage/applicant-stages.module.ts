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


@Module({

    imports: [
        TypeOrmModule.forFeature([
            Stage,
            Jobs,
            JobStage,
            ApplicantApplication,
            Regions,
            Users,
            PersonalAccessToken,
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