 import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ApplicantCultures } from 'src/entities/applicants/applicant-cultures.entity';
import { Applicants } from 'src/entities/applicants/applicants.entity';
import { Users } from 'src/entities/users.entity';
import { Cultures } from 'src/entities/cultures.entity';

import { ApplicantCulturesController } from './applicant-cultures.controller';
import { ApplicantCulturesService } from './applicant-cultures.service';
import { PersonalAccessToken } from 'src/entities/personal-access-token.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ApplicantCultures,
      Applicants,
      Users,
      Cultures,
      PersonalAccessToken,
    ]),
  ],

  controllers: [
    ApplicantCulturesController,
  ],

  providers: [
    ApplicantCulturesService,
  ],

  exports: [
    ApplicantCulturesService,
  ],
})
export class ApplicantCulturesModule {}