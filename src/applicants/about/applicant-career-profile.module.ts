 import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ApplicantCareers } from 'src/entities/applicants/applicant-careers.entity';
import { Applicants } from 'src/entities/applicants/applicants.entity';
import { Users } from 'src/entities/users.entity';
import { ApplicantCareersService } from './applicant-career-profile.service';
import { ApplicantCareersController } from './applicant-career-profile.controller';
import { PersonalAccessToken } from 'src/entities/personal-access-token.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ApplicantCareers,
      Applicants,
      Users,
      PersonalAccessToken,
    ]),
  ],

  controllers: [
    ApplicantCareersController,
  ],

  providers: [
    ApplicantCareersService,
  ],

  exports: [
    ApplicantCareersService,
  ],
})
export class ApplicantCareersModule {}