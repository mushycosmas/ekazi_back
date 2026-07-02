import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Users } from 'src/entities/users.entity';

import { EmployerUserController } from './controllers/employer-user.controller';
import { EmployerUserService } from './services/employer-user.service';
import { EmployerService } from './employer.service';
import { EmployerController } from './employer.controller';
import { Jobs } from 'src/jobs/entities/job.entity';
import { PersonalAccessToken } from 'src/entities/personal-access-token.entity';
import { EmployerJobsService } from './services/employer-jobs.service';
import { EmployerJobsController } from './controllers/employer-jobs.controller';
import { EmployerDashboardController } from './controllers/employer-dashboard.controller';
import { EmployerDashboardService } from './services/employer-dashboard.service';
import { ApplicantApplication } from 'src/entities/applicants/applicant-applicantions.entity';
import { JobStage } from 'src/jobs/entities/job-stage.entity';
import { Clients } from 'src/client/clients.entity';
import { ClientEmail } from 'src/client/entities/client-email.entity';
import { ClientAddress } from 'src/client/entities/client-address.entity';
import { ClientPhone } from 'src/client/entities/client-phones.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Jobs,
      Users,
      PersonalAccessToken, // 👈 THIS FIXES YOUR ERROR
      ApplicantApplication,
      JobStage,
      Clients,
      ClientEmail,
      ClientAddress,
      ClientPhone,
    ]),
  ],
  controllers: [
    EmployerController,
    EmployerUserController,
    EmployerJobsController,
    EmployerDashboardController,
  ],
  providers: [
    EmployerUserService,
    EmployerService,
    EmployerJobsService,
    EmployerDashboardService,
  ],
  exports: [EmployerService],
})
export class EmployerModule { }