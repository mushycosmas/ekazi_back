 import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';


import { ApplicantLanguagesService } from './applicant-languages.service';
import { ApplicantLanguagesController } from './applicant-languages.controller';
import { ApplicantLanguages } from 'src/entities/applicants/applicant-languages.entity';
import { Applicants } from 'src/entities/applicants/applicants.entity';
import { Languages } from 'src/entities/languages.entity';
import { LanguageReads } from 'src/entities/language-reads.entity';
import { LanguageWrites } from 'src/entities/language-writes.entity';
import { LanguageSpeaks } from 'src/entities/language-speaks.entity';
import { LanguageUnderstands } from 'src/entities/language-understands.entity';
import { Users } from 'src/entities/users.entity';
import { PersonalAccessToken } from 'src/entities/personal-access-token.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ApplicantLanguages,
      Applicants,
      Languages,
      LanguageReads,
      LanguageWrites,
      LanguageSpeaks,
      LanguageUnderstands,
      Users,
      PersonalAccessToken,
    ]),
  ],

  controllers: [
    ApplicantLanguagesController,
  ],

  providers: [
    ApplicantLanguagesService,
  ],

  exports: [
    ApplicantLanguagesService,
  ],
})
export class ApplicantLanguagesModule {}