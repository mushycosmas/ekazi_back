 import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ApplicantEducation } from 'src/entities/applicants/applicant-education.entity';
import { Applicants } from 'src/entities/applicants/applicants.entity';
import { Users } from 'src/entities/users.entity';

import { Colleges } from 'src/entities/colleges.entity';
import { Courses } from 'src/entities/courses.entity';
import { Majors } from 'src/entities/majors.entity';
import { EducationLevels } from 'src/entities/education-levels.entity';

import { ApplicantEducationController } from './applicant-education.controller';
import { ApplicantEducationService } from './applicant-education.service';
import { PersonalAccessToken } from 'src/entities/personal-access-token.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ApplicantEducation,
      Applicants,
      Users,
      Colleges,
      Courses,
      Majors,
      EducationLevels,
      PersonalAccessToken,
    ]),
  ],

  controllers: [
    ApplicantEducationController,
  ],

  providers: [
    ApplicantEducationService,
  ],

  exports: [
    ApplicantEducationService,
  ],
})
export class ApplicantEducationModule {}