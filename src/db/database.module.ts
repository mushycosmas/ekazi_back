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
import { JobCarts } from 'src/jobs/entities/job-carts.entity';


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
import { Jobs } from 'src/jobs/entities/job.entity';
import { Contacts } from 'src/jobs/entities/contacts.entity';
import { Currencies } from 'src/entities/currencies.entity';
import { Clients } from 'src/client/clients.entity';
import { JobAddresses } from 'src/jobs/entities/job-addresses.entity';
import { JobAlerts } from 'src/jobs/entities/job-alerts.entity';
import { JobApplicationModals } from 'src/jobs/entities/job-application-modals.entity';
import { JobApplicationOptions } from 'src/jobs/entities/job-application-options.entity';
import { JobApplicationSubscriptions } from 'src/jobs/entities/job-application-subscriptions.entity';
import { JobApplyConditions } from 'src/jobs/entities/job-apply-conditions.entity';
import { JobCourses } from 'src/jobs/entities/job-courses.entity';
import { JobCultures } from 'src/jobs/entities/job-cultures.entity';
import { JobEducation } from 'src/jobs/entities/job-education.entity';
import { JobEmails } from 'src/jobs/entities/job-emails.entity';
import { JobEvaluationAptitudes } from 'src/jobs/entities/job-evaluation-aptitudes.entity';
import { JobEvaluationGenerals } from 'src/jobs/entities/job-evaluation-generals.entity';
import { JobEvaluationSpecifics } from 'src/jobs/entities/job-evaluation-specifics.entity';
import { JobExternalUrls } from 'src/jobs/entities/job-external-urls.entity';
import { JobKnowledge } from 'src/jobs/entities/job-knowledge.entity';
import { JobLanguages } from 'src/jobs/entities/job-languages.entity';
import { JobLikes } from 'src/jobs/entities/job-likes.entity';
import { JobMajors } from 'src/entities/job-majors.entity';
import { JobMatchNotifications } from 'src/jobs/entities/job-match-notifications.entity';
import { MetaKeywords } from 'src/entities/meta-keywords.entity';
import { JobMetas } from 'src/jobs/entities/job-metas.entity';
import { JobOtherRequirements } from 'src/jobs/entities/job-other-requirements.entity';
import { JobPersonalities } from 'src/jobs/entities/job-personalities.entity';
import { Plans } from 'src/entities/plans.entity';
import { PlanTypes } from 'src/entities/plan-types.entity';
import { JobPlans } from 'src/jobs/entities/job-plans.entity';
import { PaymentMethods } from 'src/entities/payment-methods.entity';
import { ClientSubscriptionPayments } from 'src/client/client-subscription-payments.entity';
import { JobPositions } from 'src/jobs/entities/job-positions.entity';
import { JobProficiencies } from 'src/jobs/entities/job-proficiencies.entity';
import { JobReportTos } from 'src/jobs/entities/job-report-tos.entity';
import { JobRequirements } from 'src/jobs/entities/job-requirements.entity';
import { JobSalaries } from 'src/jobs/entities/job-salaries.entity';
import { JobServiceInfos } from 'src/jobs/entities/job-service-infos.entity';
import { JobShortListings } from 'src/jobs/entities/job-short-listings.entity';


@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: 'root123',
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
        Languages,
        Jobs,
        Contacts,
        Currencies,
        Clients,
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
        Plans,
        PlanTypes,
        PaymentMethods,
        JobPlans,
        ClientSubscriptionPayments,
        JobPositions,
        JobProficiencies,
        JobReportTos,
        JobRequirements,
        JobSalaries,
        JobServiceInfos,
        JobShortListings,
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
      Languages,
      // Correspondences,
      Jobs,
      Contacts,
      Currencies,
      Clients,
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
      JobLanguages,
      JobLikes,
      JobMajors,
      JobMatchNotifications,
      MetaKeywords,
      JobMetas,
      JobOtherRequirements,
      JobPersonalities,
      Plans,
      PlanTypes,
      PaymentMethods,
      JobPlans,
      ClientSubscriptionPayments,
      JobPositions,
      JobProficiencies,
      JobReportTos,
      JobRequirements,
      JobSalaries,
      JobServiceInfos,
      JobShortListings,

    ]),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule { }