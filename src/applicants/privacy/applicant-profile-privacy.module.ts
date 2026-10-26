 import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ApplicantProfilePrivacy } from 'src/entities/applicants/applicant-profile-privacy.entity';
import { ApplicantProfilePrivacyService } from './applicant-profile-privacy.service';
import { ApplicantProfilePrivacyController } from './applicant-profile-privacy.controller';
import { Applicants } from 'src/entities/applicants/applicants.entity';
import { Users } from 'src/entities/users.entity';
import { PersonalAccessToken } from 'src/entities/personal-access-token.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ApplicantProfilePrivacy,
      Applicants,
      Users,
      PersonalAccessToken,
    ]),
  ],
  controllers: [ApplicantProfilePrivacyController],
  providers: [ApplicantProfilePrivacyService],
  exports: [ApplicantProfilePrivacyService],
})
export class ApplicantProfilePrivacyModule {}