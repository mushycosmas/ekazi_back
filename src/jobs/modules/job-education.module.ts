import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JobEducation } from '../entities/job-education.entity';
import { JobEducationService } from '../services/job-education.service';
import { JobEducationController } from '../controllers/job-education.controller';
import { JobLanguagesModule } from './job-languages.module';
import { JobReportTosModule } from './job-report-tos.module';
import { JobRequirementsModule } from './job-requirements.module';
import { JobOtherRequirementsModule } from './job-other-requirements.module';

@Module({
    imports: [TypeOrmModule.forFeature([JobEducation]), JobLanguagesModule, JobReportTosModule, JobRequirementsModule, JobOtherRequirementsModule],
    controllers: [JobEducationController],
    providers: [JobEducationService],
    exports: [JobEducationService], // optional (use if other modules need it)
})
export class JobEducationModule { }
