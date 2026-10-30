
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ApplicationsController } from './application.controller';
import { ApplicationsService } from './application.service';

import { Jobs } from '../jobs/entities/job.entity';
import { JobStage } from '../jobs/entities/job-stage.entity';
import { JobApplicationModals } from '../jobs/entities/job-application-modals.entity';

import { Applicants } from '../entities/applicants/applicants.entity';
import { ApplicantApplication } from '../entities/applicants/applicant-applicantions.entity';
import { ApplicantListing } from '../entities/applicants/applicant-listings.entity';
import { Stage } from '../entities/stage.entity';
import { Users } from '../entities/users.entity';
 

import { ApplicationsEmailService } from './applications-email.service';
import { PersonalAccessToken } from 'src/entities/personal-access-token.entity';
import { Notification } from 'src/client/entities/notifications.entity';
import { NonUserApplication } from 'src/entities/applicants/non-user-application.entity';
import { NonUserApplicationFile } from 'src/entities/applicants/non-user-application-file.entity';
import { MailModule } from 'src/mail/mail.module';
import { JobStatistics } from 'src/jobs/entities/job-statistics.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Jobs,
      JobStage,
      JobApplicationModals,
      Applicants,
      ApplicantApplication,
      ApplicantListing,
      Stage,
      Users,
      Notification,
      PersonalAccessToken,
      Notification,
      NonUserApplication,
      NonUserApplicationFile,
      JobStatistics,
      
    ]),
    MailModule,
  ],
  controllers: [ApplicationsController],
  providers: [
    ApplicationsService,
    ApplicationsEmailService,
  ],
  exports: [ApplicationsService],
})
export class ApplicationModule {}
