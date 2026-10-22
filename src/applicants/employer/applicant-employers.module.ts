import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ApplicantEmployers } from
  'src/entities/applicants/applicant-employers.entity';

import { ApplicantPositions } from
  'src/entities/applicants/applicant-positions.entity';

import { Regions } from 'src/entities/regions.entity';

import { ApplicantEmployersController } from
  './applicant-employers.controller';

import { ApplicantEmployersService } from
  './applicant-employers.service';
import { Users } from 'src/entities/users.entity';
import { PersonalAccessToken } from 'src/entities/personal-access-token.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ApplicantEmployers,
      ApplicantPositions,
      Regions,
      Users,
      PersonalAccessToken,
    ]),
  ],
  controllers: [ApplicantEmployersController],
  providers: [ApplicantEmployersService],
  exports: [ApplicantEmployersService],
})
export class ApplicantEmployersModule {}