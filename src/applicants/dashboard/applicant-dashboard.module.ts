 import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ApplicantDashboardService } from './applicant-dashboard.service';
import { Applicants } from 'src/entities/applicants/applicants.entity';
import { ApplicantApplication } from
  'src/entities/applicants/applicant-applicantions.entity';
import { JobCarts } from 'src/jobs/entities/job-carts.entity';
import { ApplicantSavedResumes } from 'src/entities/applicants/applicant-cv-template.entity';
import { ApplicantDashboardController } from './applicant-dashboard.controller';
import { Users } from 'src/entities/users.entity';
import { PersonalAccessToken } from 'src/entities/personal-access-token.entity';
import { JobStage } from 'src/jobs/entities/job-stage.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Applicants,
      ApplicantApplication,
      JobCarts,
      ApplicantSavedResumes,
      Users,
      PersonalAccessToken,
      JobStage,
    ]),
  ],
  controllers: [ApplicantDashboardController],
  providers: [ApplicantDashboardService],
  exports: [ApplicantDashboardService],
})
export class ApplicantDashboardModule {}