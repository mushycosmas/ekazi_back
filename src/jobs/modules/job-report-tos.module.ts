import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JobReportTos } from '../entities/job-report-tos.entity';
import { JobReportTosService } from '../services/job-report-tos.service';
import { JobReportTosController } from '../controllers/job-report-tos.controller';

@Module({
    imports: [TypeOrmModule.forFeature([JobReportTos])],
    controllers: [JobReportTosController],
    providers: [JobReportTosService],
    exports: [JobReportTosService],
})
export class JobReportTosModule { }
