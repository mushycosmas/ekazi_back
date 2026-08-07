// src/db/database.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

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
import { ApplicantEmployers } from '../entities/applicants/applicant-employers.entity';
import { ApplicantObjective } from '../entities/applicants/applicant-objective.entity';

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
import { Colleges } from '../entities/colleges.entity';
import { Proficiencies } from '../entities/proficiencies.entity';
import { Industries } from '../entities/industries.entity';
import { Languages } from '../entities/languages.entity';
import { Role } from '../entities/role.entity';
import { Permission } from '../entities/permission.entity';
import { Currencies } from '../entities/currencies.entity';
import { JobMajors } from '../entities/job-majors.entity';
import { MetaKeywords } from '../entities/meta-keywords.entity';
import { Plans } from '../entities/plans.entity';
import { PlanTypes } from '../entities/plan-types.entity';
import { PaymentMethods } from '../entities/payment-methods.entity';
import { JobUniversalTypes } from '../entities/job-universal-types.entity';

// ----------------------
// Job Entities
// ----------------------
import { Jobs } from '../jobs/entities/job.entity';
import { Contacts } from '../jobs/entities/contacts.entity';
import { Clients } from '../client/clients.entity';
import { ClientSubscriptionPayments } from '../client/client-subscription-payments.entity';
import { JobCarts } from '../jobs/entities/job-carts.entity';
import { JobAddresses } from '../jobs/entities/job-addresses.entity';
import { JobAlerts } from '../jobs/entities/job-alerts.entity';
import { JobApplicationModals } from '../jobs/entities/job-application-modals.entity';
import { JobApplicationOptions } from '../jobs/entities/job-application-options.entity';
import { JobApplicationSubscriptions } from '../jobs/entities/job-application-subscriptions.entity';
import { JobApplyConditions } from '../jobs/entities/job-apply-conditions.entity';
import { JobCourses } from '../jobs/entities/job-courses.entity';
import { JobCultures } from '../jobs/entities/job-cultures.entity';
import { JobEducation } from '../jobs/entities/job-education.entity';
import { JobEmails } from '../jobs/entities/job-emails.entity';
import { JobEvaluationAptitudes } from '../jobs/entities/job-evaluation-aptitudes.entity';
import { JobEvaluationGenerals } from '../jobs/entities/job-evaluation-generals.entity';
import { JobEvaluationSpecifics } from '../jobs/entities/job-evaluation-specifics.entity';
import { JobExternalUrls } from '../jobs/entities/job-external-urls.entity';
import { JobKnowledge } from '../jobs/entities/job-knowledge.entity';
import { JobLanguages } from '../jobs/entities/job-languages.entity';
import { JobLikes } from '../jobs/entities/job-likes.entity';
import { JobMatchNotifications } from '../jobs/entities/job-match-notifications.entity';
import { JobMetas } from '../jobs/entities/job-metas.entity';
import { JobOtherRequirements } from '../jobs/entities/job-other-requirements.entity';
import { JobPersonalities } from '../jobs/entities/job-personalities.entity';
import { JobPlans } from '../jobs/entities/job-plans.entity';
import { JobPositions } from '../jobs/entities/job-positions.entity';
import { JobProficiencies } from '../jobs/entities/job-proficiencies.entity';
import { JobReportTos } from '../jobs/entities/job-report-tos.entity';
import { JobRequirements } from '../jobs/entities/job-requirements.entity';
import { JobSalaries } from '../jobs/entities/job-salaries.entity';
import { JobServiceInfos } from '../jobs/entities/job-service-infos.entity';
import { JobShortListings } from '../jobs/entities/job-short-listings.entity';
import { JobTypes } from '../jobs/entities/job-types.entity';
import { JobStatistics } from '../jobs/entities/job-statistics.entity';
import { JobSoftware } from '../jobs/entities/job-software.entity';
import { JobTool } from '../jobs/entities/job-tool.entity';
import { JobAbility } from '../jobs/entities/job-abilities.entity';
import { PersonalAccessToken } from 'src/entities/personal-access-token.entity';
import { PasswordReset } from 'src/entities/password-resets.entity';
import { EmailVerification } from 'src/entities/email-verification.entity';
import { ApplicantApplication } from 'src/entities/applicants/applicant-applicantions.entity';
import { ClientAddress } from 'src/client/entities/client-address.entity';
import { ClientEmail } from 'src/client/entities/client-email.entity';
import { ClientPhone } from 'src/client/entities/client-phones.entity';
import { Notification } from 'src/client/entities/notifications.entity';
import { ClientDescription } from 'src/client/entities/client-descriptions.entity';
import { ClientType } from 'src/client/entities/client-types.entity';
import { CompanySize } from 'src/entities/company-size.entity';
import { Stage } from 'src/entities/stage.entity';
import { JobStage } from 'src/jobs/entities/job-stage.entity';
import { Task } from 'src/tasks/entities/tasks.entity';
import { TaskAssignment } from 'src/tasks/entities/task-assignments.entity';
import { ApplicantListing } from 'src/entities/applicants/applicant-listings.entity';
import { JobTestResult } from 'src/jobs/entities/job-test-results.entity';
import { ClientStaff } from 'src/client/entities/client-staff.entity';
import { InterviewAction } from 'src/jobs/entities/interview/interview-action.entity';
import {  InterviewParticipantEmail } from 'src/jobs/entities/interview/interview-participant-email.entity';
import { InterviewPanelComment} from 'src/jobs/entities/interview/interview-panel-comment.entity';
import { InterviewStageRound } from 'src/jobs/entities/interview/interview-stage-round.entity';
import { InterviewAttendenceTracker } from 'src/jobs/entities/interview/interview-attendance-trackers.entity';
import { InterviewType } from 'src/jobs/entities/interview/interview-type.entity';
import { InterviewPanel } from 'src/jobs/entities/interview/interview-panel.entity';
import { TaskAttachment } from 'src/tasks/entities/task-attachments.entity';
import { MoodleUser } from 'src/entities/moodle-user.entity';
import { ApplicantFeaturedPlan } from 'src/entities/applicants/applicant-featured-plan.entity';
import { ApplicantFeaturedPlanSubscription } from 'src/entities/applicants/applicant-featured-plan-subscription.entity';
import { UserPermission } from 'src/entities/user-permission.entity';
 


// Create a single array of all entities to avoid duplication
const allEntities = [
  // Applicant Entities
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

  // Core Entities
  Users,
  Role,
  PersonalAccessToken,
  PasswordReset,
  EmailVerification,
  Permission,
  MaritalStatuses,
  Genders,
  Cultures,
  LanguageReads,
  LanguageWrites,
  LanguageSpeaks,
  LanguageUnderstands,

  // Business Entities
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
  Languages,


  // Jobs & Related
  Jobs,
  JobAddresses,
  JobAlerts,
  JobApplicationModals,
  JobApplicationOptions,
  JobApplicationSubscriptions,
  JobApplyConditions,
  JobCarts,
  JobCourses,
  JobCultures,
  JobEducation,
  JobEmails,
  JobEvaluationAptitudes,
  JobEvaluationGenerals,
  JobEvaluationSpecifics,
  JobExternalUrls,
  JobKnowledge,
  JobLanguages,
  JobLikes,
  JobMajors,
  JobMatchNotifications,
  MetaKeywords,
  JobMetas,
  JobOtherRequirements,
  JobPersonalities,
  JobPlans,
  JobPositions,
  JobProficiencies,
  JobReportTos,
  JobRequirements,
  JobSalaries,
  JobServiceInfos,
  JobShortListings,
  JobTypes,
  JobUniversalTypes,
  JobStatistics,
  JobSoftware,
  JobTool,
  JobAbility,
  ApplicantApplication,
  JobStage,
  UserPermission,
  

  // Other
  Currencies,
  Clients,
  Contacts,
  Plans,
  PlanTypes,
  PaymentMethods,
  ClientSubscriptionPayments,
  ClientAddress,
  ClientEmail,
  ClientPhone,
  Notification,
  ClientDescription,
  ClientType,
  CompanySize,
  Stage,
  Task,
  TaskAssignment,
  TaskAttachment,
  ApplicantListing,
  JobTestResult,
  ClientStaff,
  InterviewAction,
  InterviewPanelComment,
  InterviewStageRound,
  InterviewAttendenceTracker,
  InterviewType,
  InterviewPanel,
  InterviewParticipantEmail,
  ApplicantFeaturedPlan,
  ApplicantFeaturedPlanSubscription,
  
];
const secondDatabaseEntities=[
  MoodleUser
];

@Module({
  
  imports: [
    // Async configuration with environment variables
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'mysql',
        host: config.get('DB_HOST'),
        port: config.get('DB_PORT'),
        username: config.get('DB_USER'),
        password: config.get('DB_PASS'),
        database: config.get('DB_NAME'),
        entities: allEntities,
        synchronize: false, // Always false for production
        logging: config.get('NODE_ENV'),
        // Optional: Add these for better performance
        // poolSize: 10,
        // connectTimeout: 30000,
        // acquireTimeout: 30000,
      }),

    }),
      // Second Database
  // ===========================================
  TypeOrmModule.forRootAsync({
    name: 'second_db',
    imports: [ConfigModule],
    inject: [ConfigService],
    useFactory: (config: ConfigService) => ({
      type: 'mysql',
      host: config.get('DB_HOST_2'),
      port: Number(config.get('DB_PORT_2')),
      username: config.get('DB_USERNAME_2'),
      password: config.get('DB_PASSWORD_2'),
      database: config.get('DB_DATABASE_2'),

      // Register only entities that belong to database 2
      entities: secondDatabaseEntities,

      synchronize: false,
      logging: config.get('NODE_ENV') !== 'production',
    }),
  }),


  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule { }