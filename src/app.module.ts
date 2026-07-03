// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './db/database.module'; // Import your database module
import { CvbuilderModule } from './cvbuilder/cvbuilder.module';
import { EmployerUserService } from './employer/services/employer-user.service';
import { RegionsModule } from './regions/regions.module';
import { RegionsController } from './regions/regions.controller';
import { RegionsService } from './regions/regions.service';
import { CountriesController } from './Countries/countries.controller';
import { CountriesService } from './Countries/countries.service';
import { CountriesModule } from './Countries/countries.module';
import { LanguagesModule } from './languages/languages.module';
import { SoftwaresModule } from './softwares/softwares.module';
import { ToolsModule } from './tools/tools.module';
import { CulturesModule } from './cultures/cultures.module';
import { SalaryRangesModule } from './salaryRanges/salary-ranges.module';
import { EducationLevelsModule } from './educations/education-levels.module';
import { CollegesModule } from './colleges/colleges.module';
import { CoursesModule } from './courses/courses.module';
import { GendersModule } from './genders/genders.module';
import { IndustriesModule } from './industries/industries.module';
import { KnowledgeModule } from './knowledge/knowledge.module';
import { MajorsModule } from './majors/majors.module';
import { OrganizationsModule } from './organizations/organizations.module';
import { PersonalitiesModule } from './personalities/personalities.module';
import { PositionsModule } from './positions/positions.module';
import { ProficienciesModule } from './proficiencies/proficiencies.module';
import { MalitalStatusesModule } from './maritalstatuses/malital-statuses.module';
import { LanguageReadsModule } from './languagereads/language-reads.module';
import { LanguageSpeaksModule } from './languagespeaks/language-speaks.module';
import { JobsModule } from './jobs/jobs.module';
import { JobMetasModule } from './jobs/modules/job-metas.module';
import { JobEducationModule } from './jobs/modules/job-education.module';
import { JobLanguagesModule } from './jobs/modules/job-languages.module';
import { JobReportTosModule } from './jobs/modules/job-report-tos.module';
import { JobRequirementsModule } from './jobs/modules/job-requirements.module';
import { JobOtherRequirementsModule } from './jobs/modules/job-other-requirements.module';
import { AuthModule } from './auth/auth.module';
import { EmployerController } from './employer/employer.controller';
import { EmployerModule } from './employer/employer.module';
import { CompanySizesModule } from './companysize/company-sizes.module';
import { MetaKeywordsModule } from './metas/meta-keywords.module';
import { CompanyTypeModule } from './companytype/company-type.module';
import { StagesModule } from './stage/stages.module';
import { PositionLevelsModule } from './positionlevel/position-levels.module';

 
// ... other imports

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
 
    DatabaseModule, // Use your database module instead of direct TypeOrmModule

    CvbuilderModule, AuthModule,EmployerModule, CompanySizesModule,MetaKeywordsModule,
    RegionsModule, CountriesModule,CompanyTypeModule,StagesModule,PositionLevelsModule,
    LanguagesModule, SoftwaresModule, ToolsModule, CulturesModule, SalaryRangesModule, EducationLevelsModule,
    CollegesModule, CoursesModule, GendersModule, IndustriesModule, KnowledgeModule, MajorsModule, OrganizationsModule,
    PersonalitiesModule, PositionsModule, ProficienciesModule, MalitalStatusesModule, LanguageReadsModule,
    LanguageSpeaksModule, JobsModule, JobMetasModule,JobEducationModule,JobLanguagesModule, JobReportTosModule,
    JobRequirementsModule,JobOtherRequirementsModule,

    // ... other modules
  ],
  controllers: [EmployerController,
    RegionsController, CountriesController],
  providers: [EmployerUserService, RegionsService, CountriesService],

})
export class AppModule { }