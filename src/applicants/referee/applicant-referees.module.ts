 import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

 
import { Users } from 'src/entities/users.entity';
import { Applicants } from 'src/entities/applicants/applicants.entity';
import { ApplicantReferees } from 'src/entities/applicants/applicant-referees.entity';

import { ApplicantRefereesService } from './applicant-referees.service';
import { ApplicantRefereesController } from './applicant-referees.controller';
import { PersonalAccessToken } from 'src/entities/personal-access-token.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ApplicantReferees,
      Applicants,
      Users,
      PersonalAccessToken,
    ]),
  ],

  controllers: [
    ApplicantRefereesController,
  ],

  providers: [
    ApplicantRefereesService,
  ],

  exports: [
    ApplicantRefereesService,
  ],
})
export class ApplicantRefereesModule {}