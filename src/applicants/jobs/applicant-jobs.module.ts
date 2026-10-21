import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ApplicantSaveJobs } from
    'src/entities/applicants/applicant-save-jobs.entity';



import { ApplicantJobsController } from
    './applicant-jobs.controller';

import { ApplicantJobsService } from
    './applicant-jobs.service';
import { Users } from 'src/entities/users.entity';
import { PersonalAccessToken } from 'src/entities/personal-access-token.entity';
import { JobLikes } from 'src/jobs/entities/job-likes.entity';
import { JobsModule } from 'src/jobs/jobs.module';
import { Jobs } from 'src/jobs/entities/job.entity';
import { JobMetasModule } from 'src/jobs/modules/job-metas.module';
import { JobReportTosModule } from 'src/jobs/modules/job-report-tos.module';
import { JobEducationModule } from 'src/jobs/modules/job-education.module';
import { JobLanguagesModule } from 'src/jobs/modules/job-languages.module';
import { JobRequirementsModule } from 'src/jobs/modules/job-requirements.module';
import { JobOtherRequirementsModule } from 'src/jobs/modules/job-other-requirements.module';
import { JobSettingsModule } from 'src/jobs/modules/job-settings.module';
import { CvbuilderModule } from 'src/cvbuilder/cvbuilder.module';
import { ApplicantStagesModule } from 'src/stage/applicant-stages.module';
import { ApplicantModule } from '../applicant.module';
import { JobMatchModule } from 'src/jobs/modules/job-match.module';
import { ApplicantApplication } from 'src/entities/applicants/applicant-applicantions.entity';
import { Applicants } from 'src/entities/applicants/applicants.entity';
import { JobCarts } from 'src/jobs/entities/job-carts.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            JobLikes,
            JobCarts,
            Jobs,
            Users,
            PersonalAccessToken,
            ApplicantApplication,
            Applicants,

        ]),
        JobsModule,
        JobMetasModule,
        JobReportTosModule,
        JobEducationModule,
        JobLanguagesModule,
        JobRequirementsModule,
        JobOtherRequirementsModule,
        JobSettingsModule,
        CvbuilderModule,
        ApplicantStagesModule,
        ApplicantModule,
        JobMatchModule,

    ],
    controllers: [
        ApplicantJobsController,
    ],
    providers: [
        ApplicantJobsService,
    ],
    exports: [
        ApplicantJobsService,
    ],
})
export class ApplicantJobsModule { }



