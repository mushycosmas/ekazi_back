// src/db/database.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// ----------------------
// Applicant Entities
// ----------------------
import { Applicants } from '../entities/applicants/applicants.entity';
import { ApplicantReferees } from '../entities/applicants/applicant-referees.entity';
import { ApplicantCareers } from '../entities/applicants/applicant-careers.entity';
import { ApplicantTrainings } from '../entities/applicants/applicant-trainings.entity';
import { ApplicantCultures } from '../entities/applicants/applicant-cultures.entity';
import { ApplicantPersonalities } from '../entities/applicants/applicant-personalities.entity';
import { ApplicantTools } from '../entities/applicants/applicant-tools.entity';
import { ApplicantSoftware } from '../entities/applicants/applicant-software.entity';
import { ApplicantKnowledge } from '../entities/applicants/applicant-knowledge.entity';
import { ApplicantProficiencies } from '../entities/applicants/applicant-proficiencies.entity';
import { ApplicantAddresses } from '../entities/applicants/applicant-addresses.entity';
import { ApplicantPhones } from '../entities/applicants/applicant-phones.entity';
import { ApplicantEducation } from '../entities/applicants/applicant-education.entity';
import { ApplicantPositions } from '../entities/applicants/applicant-positions.entity';
import { ApplicantLanguages } from '../entities/applicants/applicant-languages.entity';
import { ApplicantEmployers } from 'src/entities/applicants/applicant-employers.entity';


// ----------------------
// Other Main Entities
// ----------------------
import { Users } from '../entities/users.entity';
import { MaritalStatuses } from '../entities/marital-statuses.entity';
import { Genders } from '../entities/genders.entity';
import { Cultures } from '../entities/cultures.entity';
import { LanguageReads } from '../entities/language-reads.entity';
import { LanguageWrites } from '../entities/language-writes.entity';
import { LanguageSpeaks } from '../entities/language-speaks.entity';
import { LanguageUnderstands } from '../entities/language-understands.entity';
import { Organizations } from '../entities/organizations.entity';
import { Courses } from '../entities/courses.entity';
import { EducationLevels } from '../entities/education-levels.entity';
import { PositionLevels } from '../entities/position-levels.entity';
import { Positions } from '../entities/positions.entity';
import { SalaryRanges } from '../entities/salary-ranges.entity';
import { Tools } from '../entities/tools.entity';
import { Softwares } from '../entities/softwares.entity';
import { Knowledge } from '../entities/knowledge.entity';
import { Personalities } from '../entities/personalities.entity';
import { Majors } from '../entities/majors.entity';
import { Regions } from '../entities/regions.entity';
import { Countries } from '../entities/countries.entity';
import { Colleges } from 'src/entities/colleges.entity';
import { Proficiencies } from 'src/entities/proficiencies.entity';
import { Industries } from 'src/entities/industries.entity';
import { Languages } from 'src/entities/languages.entity';
import { ApplicantObjective } from 'src/entities/applicants/applicant-objective.entity';

// import { Correspondences } from '../entities/correspondences.entity';
import { Role } from 'src/entities/role.entity';
import { Permission } from 'src/entities/permission.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      // password: 'root123',
      database: 'ekazi',
      entities: [
        // Applicant-related
        Applicants,
        ApplicantReferees,
        ApplicantCareers,
        ApplicantTrainings,
        ApplicantCultures,
        ApplicantPersonalities,
        ApplicantTools,
        ApplicantSoftware,
        ApplicantKnowledge,
        ApplicantProficiencies,
        ApplicantAddresses,
        ApplicantPhones,
        ApplicantEducation,
        ApplicantPositions,
        ApplicantLanguages,
        ApplicantEmployers,
        ApplicantObjective,

        // Other main entities
        Users,
        Role,
        Permission,
        MaritalStatuses,
        Genders,
        Cultures,
        LanguageReads,
        LanguageWrites,
        LanguageSpeaks,
        LanguageUnderstands,
        Organizations,
        Courses,
        EducationLevels,
        PositionLevels,
        Positions,
        SalaryRanges,
        Tools,
        Softwares,
        Knowledge,
        Personalities,
        Majors,
        Regions,
        Countries,
        Colleges,
        Proficiencies,
        Industries,
        Languages
        // Correspondences,
      ],
      synchronize: false, // Only for dev! Auto-create tables
    }),
    TypeOrmModule.forFeature([
      // All entities available for injection
      Applicants,
      ApplicantReferees,
      ApplicantCareers,
      ApplicantTrainings,
      ApplicantCultures,
      ApplicantPersonalities,
      ApplicantTools,
      ApplicantSoftware,
      ApplicantKnowledge,
      ApplicantProficiencies,
      ApplicantAddresses,
      ApplicantPhones,
      ApplicantEducation,
      ApplicantPositions,
      ApplicantLanguages,
      ApplicantEmployers,
      ApplicantObjective,

      Users,
      Role,
      Permission,
      MaritalStatuses,
      Genders,
      Cultures,
      LanguageReads,
      LanguageWrites,
      LanguageSpeaks,
      LanguageUnderstands,
      Organizations,
      Courses,
      EducationLevels,
      PositionLevels,
      Positions,
      SalaryRanges,
      Tools,
      Softwares,
      Knowledge,
      Personalities,
      Majors,
      Regions,
      Countries,
      Colleges,
      Proficiencies,
      Industries,
      Languages
      // Correspondences,
    ]),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}