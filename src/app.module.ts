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
import { TasksModule } from './tasks/tasks.module';
import { JobSettingsModule } from './jobs/modules/job-settings.module';
import { ApplicantStagesModule } from './stage/applicant-stages.module';
import { JobUniversalTypesModule } from './jobtypes/job-universal-types.module';
import { LanguageWritesModule } from './Languagewrites/language-writes.module';
import { LanguageUnderstandsModule } from './languageunderstands/language-understands.module';
import { ClientStaffModule } from './client/client-staff.module';
import { InterviewTypeModule } from './interviewtype/interview-type.module';
import { ApplicantModule } from './applicants/applicant.module';
import { JobMatchModule } from './jobs/modules/job-match.module';
import { UsersModule } from './users/users.module';
import { ClientStaffPositionsModule } from './client-staff-positions/client-staff-positions.module';
import { PermissionModule } from './permission/permission.module';
import { AdminModule } from './admin/admin.module';
import { PaymentModule } from './payment/payment.module';
import { SubscriptionPlanFeaturesModule } from './subscriptions/subscription-plan-features.module';
import { SubscriptionPlansModule } from './subscriptions/subscription-plans.module';
import { TermConditionTypesModule } from './admin/term-condition-types/term-condition-types.module';
import { TermConditionModule } from './admin/term-condition/term-condition.module';
import { AdminSubscriptionModule } from './admin/subscription/admin-subscription.module';
import { AdminClientsModule } from './admin/Clients/admin-clients.module';
import { AdminJobsModule } from './admin/job/admin-jobs.module';
 

 
// ... other imports

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
 
    DatabaseModule, // Use your database module instead of direct TypeOrmModule

    CvbuilderModule, AuthModule,EmployerModule, CompanySizesModule,MetaKeywordsModule,JobSettingsModule,
    RegionsModule, CountriesModule,CompanyTypeModule,StagesModule,PositionLevelsModule,TasksModule,ApplicantStagesModule,
    LanguagesModule, SoftwaresModule, ToolsModule, CulturesModule, SalaryRangesModule, EducationLevelsModule,
    CollegesModule, CoursesModule, GendersModule, IndustriesModule, KnowledgeModule, MajorsModule, OrganizationsModule,
    PersonalitiesModule, PositionsModule, ProficienciesModule, MalitalStatusesModule, LanguageReadsModule,
    LanguageSpeaksModule, JobsModule, JobMetasModule,JobEducationModule,JobLanguagesModule, JobReportTosModule,
    JobRequirementsModule,JobOtherRequirementsModule,JobUniversalTypesModule, LanguageWritesModule,LanguageUnderstandsModule, ClientStaffModule,
    InterviewTypeModule ,ApplicantModule,JobMatchModule,UsersModule,ClientStaffModule,ClientStaffPositionsModule,PermissionModule,PaymentModule,SubscriptionPlanFeaturesModule,
    SubscriptionPlansModule, TermConditionTypesModule,TermConditionModule,AdminSubscriptionModule,AdminClientsModule,
    
    //admin  moudel here
    AdminModule,AdminJobsModule,

    // ... other modules
  ],
  // controllers: [EmployerController,
  //   RegionsController, CountriesController],
  // providers: [EmployerUserService, RegionsService, CountriesService],

})
export class AppModule { }