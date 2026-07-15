// src/cvbuilder/cvbuilder.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CvbuilderService } from './cvbuilder.service';
import { CvbuilderController } from './cvbuilder.controller';
import { Applicants } from 'src/entities/applicants/applicants.entity';
import { ApplicantPositions } from 'src/entities/applicants/applicant-positions.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Applicants, ApplicantPositions]), // ✅ add ApplicantPositions here
  ],
  providers: [CvbuilderService],
  controllers: [CvbuilderController],
  exports: [CvbuilderService],
})
export class CvbuilderModule {} 