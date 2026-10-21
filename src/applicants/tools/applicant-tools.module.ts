import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApplicantTools } from 'src/entities/applicants/applicant-tools.entity';
import { Applicants } from 'src/entities/applicants/applicants.entity';
import { Tools } from 'src/entities/tools.entity';
import { Users } from 'src/entities/users.entity';
import { ApplicantToolsService } from './applicant-tools.service';
import { ApplicantToolsController } from './applicant-tools.controller';
import { PersonalAccessToken } from 'src/entities/personal-access-token.entity';
 


@Module({
  imports: [
    TypeOrmModule.forFeature([
      ApplicantTools,
      Applicants,
      Users,
      Tools,
      PersonalAccessToken,
    ]),
  ],

  controllers: [
    ApplicantToolsController,
  ],

  providers: [
    ApplicantToolsService,
  ],

  exports: [
    ApplicantToolsService,
  ],
})
export class ApplicantToolsModule {}