import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Stage } from 'src/entities/stage.entity';
import { StagesController } from './stages.controller';
import { StagesService } from './stages.service';
import { ApplicantStagesService } from './applicant-stages.service';
import { ApplicantStagesController } from './applicant-stages.controller';
import { ApplicantStagesModule } from './applicant-stages.module';
import { Jobs } from 'src/jobs/entities/job.entity';

@Module({
      imports: [TypeOrmModule.forFeature([Stage]), ApplicantStagesModule],
  controllers: [StagesController],
  providers: [StagesService],
})
export class StagesModule {}
