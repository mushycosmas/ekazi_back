import { Module } from '@nestjs/common';
import { AdminJobsService } from './admin-jobs.service';
import { AdminJobsController } from './admin-jobs.controller';
import { Jobs } from 'src/jobs/entities/job.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Users } from 'src/entities/users.entity';
import { PersonalAccessToken } from 'src/entities/personal-access-token.entity';
import { JobStage } from 'src/jobs/entities/job-stage.entity';
import { ApplicantApplication } from 'src/entities/applicants/applicant-applicantions.entity';

@Module({

    imports: [
      TypeOrmModule.forFeature([
        Jobs,
        Users,
        PersonalAccessToken, 
        JobStage,
        ApplicantApplication,
      
        
        
      ]),
       
     
    ],
   
  providers: [AdminJobsService],
  controllers: [AdminJobsController]
})
export class AdminJobsModule {

}
