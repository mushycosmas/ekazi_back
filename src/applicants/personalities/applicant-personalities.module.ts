 import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ApplicantPersonalities } from 'src/entities/applicants/applicant-personalities.entity';
import { Applicants } from 'src/entities/applicants/applicants.entity';
import { Users } from 'src/entities/users.entity';
import { Personalities } from 'src/entities/personalities.entity';

import { ApplicantPersonalitiesController } from './applicant-personalities.controller';
import { ApplicantPersonalitiesService } from './applicant-personalities.service';
import { PersonalAccessToken } from 'src/entities/personal-access-token.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ApplicantPersonalities,
      Applicants,
      Users,
      Personalities,
      PersonalAccessToken,
    ]),
  ],

  controllers: [
    ApplicantPersonalitiesController,
  ],

  providers: [
    ApplicantPersonalitiesService,
  ],

  exports: [
    ApplicantPersonalitiesService,
  ],
})
export class ApplicantPersonalitiesModule {}