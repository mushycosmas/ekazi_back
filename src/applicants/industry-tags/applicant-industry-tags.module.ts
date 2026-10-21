import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ApplicantIndustryTags } from
  'src/entities/applicants/applicant-industry-tags.entity';

import { Applicants } from
  'src/entities/applicants/applicants.entity';

import { ApplicantIndustryTagsController } from
  './applicant-industry-tags.controller';

import { ApplicantIndustryTagsService } from
  './applicant-industry-tags.service';
import { Users } from 'src/entities/users.entity';
import { PersonalAccessToken } from 'src/entities/personal-access-token.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ApplicantIndustryTags,
      Applicants,
      Users,
      PersonalAccessToken,
    ]),
  ],
  controllers: [
    ApplicantIndustryTagsController,
  ],
  providers: [
    ApplicantIndustryTagsService,
  ],
  exports: [
    ApplicantIndustryTagsService,
  ],
})
export class ApplicantIndustryTagsModule {}