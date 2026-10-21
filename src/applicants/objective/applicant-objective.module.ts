 import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApplicantObjective } from 'src/entities/applicants/applicant-objective.entity';
import { Applicants } from 'src/entities/applicants/applicants.entity';
import { PersonalAccessToken } from 'src/entities/personal-access-token.entity';
import { Users } from 'src/entities/users.entity';
import { ApplicantObjectivesController } from './applicant-objective.controller';
import { ApplicantObjectivesService } from './applicant-objective.service';

 

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ApplicantObjective,
      Applicants,
      Users,
      PersonalAccessToken,
    ]),
  ],

  controllers: [
    ApplicantObjectivesController,
  ],

  providers: [
    ApplicantObjectivesService,
  ],

  exports: [
    ApplicantObjectivesService,
  ],
})
export class ApplicantObjectivesModule {}