 import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ApplicantSavedResumes } from
  'src/entities/applicants/applicant-cv-template.entity';
import { Applicants } from
  'src/entities/applicants/applicants.entity';

import { ApplicantSavedResumesController } from
  './applicant-saved-resumes.controller';
import { ApplicantSavedResumesService } from
  './applicant-saved-resumes.service';
import { Users } from 'src/entities/users.entity';
import { PersonalAccessToken } from 'src/entities/personal-access-token.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ApplicantSavedResumes,
      Applicants,
      Users,
      PersonalAccessToken,
    ]),
  ],
  controllers: [ApplicantSavedResumesController],
  providers: [ApplicantSavedResumesService],
  exports: [ApplicantSavedResumesService],
})
export class ApplicantSavedResumesModule {}