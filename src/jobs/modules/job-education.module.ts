import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JobEducation } from '../entities/job-education.entity';
import { JobEducationService } from '../services/job-education.service';
import { JobEducationController } from '../controllers/job-education.controller';
import { JobLanguagesModule } from './job-languages.module';
import { JobReportTosModule } from './job-report-tos.module';

@Module({
    imports: [TypeOrmModule.forFeature([JobEducation]), JobLanguagesModule, JobReportTosModule],
    controllers: [JobEducationController],
    providers: [JobEducationService],
    exports: [JobEducationService], // optional (use if other modules need it)
})
export class JobEducationModule { }
