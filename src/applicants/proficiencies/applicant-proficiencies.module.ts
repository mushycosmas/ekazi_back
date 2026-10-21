 import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ApplicantProficiencies } from 'src/entities/applicants/applicant-proficiencies.entity';
import { Applicants } from 'src/entities/applicants/applicants.entity';
import { Organizations } from 'src/entities/organizations.entity';
import { Proficiencies } from 'src/entities/proficiencies.entity';

import { ApplicantProficienciesController } from './applicant-proficiencies.controller';
import { ApplicantProficienciesService } from './applicant-proficiencies.service';
import { Users } from 'src/entities/users.entity';
import { PersonalAccessToken } from 'src/entities/personal-access-token.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ApplicantProficiencies,
      Applicants,
      Organizations,
      Proficiencies,
      Users,
      PersonalAccessToken
    ]),
  ],
  controllers: [ApplicantProficienciesController],
  providers: [ApplicantProficienciesService],
  exports: [ApplicantProficienciesService],
})
export class ApplicantProficienciesModule {}