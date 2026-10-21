 import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

 

import { ApplicantSoftwareService } from './applicant-software.service';
import { ApplicantSoftwareController } from './applicant-software.controller';
import { ApplicantSoftware } from 'src/entities/applicants/applicant-software.entity';
import { Applicants } from 'src/entities/applicants/applicants.entity';
import { Users } from 'src/entities/users.entity';
import { Softwares } from 'src/entities/softwares.entity';
import { PersonalAccessToken } from 'src/entities/personal-access-token.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ApplicantSoftware,
      Applicants,
      Users,
      Softwares,
      PersonalAccessToken
    ]),
  ],

  controllers: [
    ApplicantSoftwareController,
  ],

  providers: [
    ApplicantSoftwareService,
  ],

  exports: [
    ApplicantSoftwareService,
  ],
})
export class ApplicantSoftwareModule {}