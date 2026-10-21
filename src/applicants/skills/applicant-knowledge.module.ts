import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ApplicantKnowledge } from 'src/entities/applicants/applicant-knowledge.entity';
import { Applicants } from 'src/entities/applicants/applicants.entity';
import { Users } from 'src/entities/users.entity';
import { Knowledge } from 'src/entities/knowledge.entity';

import { ApplicantKnowledgeController } from './applicant-knowledge.controller';
import { ApplicantKnowledgeService } from './applicant-knowledge.service';
import { PersonalAccessToken } from 'src/entities/personal-access-token.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ApplicantKnowledge,
      Applicants,
      Users,
      Knowledge,
      PersonalAccessToken,
    ]),
  ],

  controllers: [
    ApplicantKnowledgeController,
  ],

  providers: [
    ApplicantKnowledgeService,
  ],

  exports: [
    ApplicantKnowledgeService,
  ],
})
export class ApplicantKnowledgeModule {}