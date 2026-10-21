 import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ApplicantTrainings } from 'src/entities/applicants/applicant-trainings.entity';
import { Applicants } from 'src/entities/applicants/applicants.entity';

import { ApplicantTrainingsController } from './applicant-trainings.controller';
import { ApplicantTrainingsService } from './applicant-trainings.service';
import { Users } from 'src/entities/users.entity';
import { PersonalAccessToken } from 'src/entities/personal-access-token.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ApplicantTrainings,
      Applicants,
      Users,
      PersonalAccessToken,
    ]),
  ],
  controllers: [ApplicantTrainingsController],
  providers: [ApplicantTrainingsService],
  exports: [ApplicantTrainingsService],
})
export class ApplicantTrainingsModule {}