 
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ApplicantPositions } from 'src/entities/applicants/applicant-positions.entity';
import { Applicants } from 'src/entities/applicants/applicants.entity';
import { Positions } from 'src/entities/positions.entity';
import { ApplicantEmployers } from 'src/entities/applicants/applicant-employers.entity';

import { ApplicantPositionsController } from './applicant-positions.controller';
import { ApplicantPositionsService } from './applicant-positions.service';
import { Users } from 'src/entities/users.entity';
import { PersonalAccessToken } from 'src/entities/personal-access-token.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ApplicantPositions,
      Applicants,
      Positions,
      ApplicantEmployers,
      Users,
      PersonalAccessToken,
    ]),
  ],
  controllers: [ApplicantPositionsController],
  providers: [ApplicantPositionsService],
  exports: [ApplicantPositionsService],
})
export class ApplicantPositionsModule {}
