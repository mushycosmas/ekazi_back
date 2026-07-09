import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    OneToMany,
    DeleteDateColumn,
} from 'typeorm';
import { Transform } from 'class-transformer';

import { Industries } from 'src/entities/industries.entity';
import { Countries } from 'src/entities/countries.entity';
import { Regions } from 'src/entities/regions.entity';
import { Positions } from 'src/entities/positions.entity';
import { Genders } from 'src/entities/genders.entity';
import { PositionLevels } from 'src/entities/position-levels.entity';
import { Contacts } from './contacts.entity';
import { Currencies } from 'src/entities/currencies.entity';
import { Clients } from 'src/client/clients.entity';
import { JobAddresses } from './job-addresses.entity';
import { JobAlerts } from './job-alerts.entity';
import { JobApplicationModals } from './job-application-modals.entity';
import { JobApplicationOptions } from './job-application-options.entity';
import { JobApplicationSubscriptions } from './job-application-subscriptions.entity';
import { JobApplyConditions } from './job-apply-conditions.entity';
import { JobCarts } from './job-carts.entity';
import { JobCourses } from './job-courses.entity';
import { JobCultures } from './job-cultures.entity';
import { JobEducation } from './job-education.entity';
import { JobEmails } from './job-emails.entity';
import { JobEvaluationAptitudes } from './job-evaluation-aptitudes.entity';
import { JobEvaluationSpecifics } from './job-evaluation-specifics.entity';
import { JobExternalUrls } from './job-external-urls.entity';
import { JobKnowledge } from './job-knowledge.entity';
import { JobLanguages } from './job-languages.entity';
import { JobLikes } from './job-likes.entity';
import { JobMajors } from 'src/entities/job-majors.entity';
import { JobMatchNotifications } from './job-match-notifications.entity';
import { JobOtherRequirements } from './job-other-requirements.entity';
import { JobPersonalities } from './job-personalities.entity';
import { JobPlans } from './job-plans.entity';
import { JobMetas } from './job-metas.entity';
import { JobPositions } from './job-positions.entity';
import { JobProficiencies } from './job-proficiencies.entity';
import { JobReportTos } from './job-report-tos.entity';
import { JobRequirements } from './job-requirements.entity';
import { JobSalaries } from './job-salaries.entity';
import { JobServiceInfos } from './job-service-infos.entity';
import { JobShortListings } from './job-short-listings.entity';
import { JobTypes } from './job-types.entity';
import { JobStatistics } from './job-statistics.entity';
import { JobSoftware } from './job-software.entity';
import { JobTool } from './job-tool.entity';
import { JobUniversalTypes } from 'src/entities/job-universal-types.entity';
import { ApplicantApplication } from 'src/entities/applicants/applicant-applicantions.entity';
import { JobStage } from './job-stage.entity';


@Entity('jobs')
export class Jobs {
    @PrimaryGeneratedColumn({ unsigned: true })
    id: number;

    @Column({ nullable: true })
    assigned_to: number;

    @Column({ nullable: true })
    assigned_by: number;

    @Column({ nullable: true })
    subscription_id: number;

    @Column({ unsigned: true })
    client_id: number;

    @Column({ nullable: true, unsigned: true })
    manager_id1: number;

    @Column({ nullable: true, unsigned: true })
    industry_id: number;

    @Column()
    category_id: number;

    @Column()
    country_id: number;

    @Column({ nullable: true, unsigned: true })
    region_id: number;

    @Column({ unsigned: true })
    creator_id: number;

    @Column({ unsigned: true })
    updator_id: number;

    @Column({ nullable: true, unsigned: true })
    gender_id: number;

    @Column({ unsigned: true })
    type_id: number;

    @Column({ unsigned: true })
    stage_id: number;

    @Column()
    position_id: number;

    @Column({ nullable: true, unsigned: true })
    allow_id: number;

    @Column({ nullable: true, unsigned: true })
    contact_id: number;

    @Column({ nullable: true, unsigned: true })
    authorized_id: number;

    @Column()
    position_level_id: number;

    @Column({ nullable: true, unsigned: true })
    currency_id: number;

    @Column({ default: false })
    show_client_name: boolean;

    @Column({ length: 300, nullable: true })
    title: string;

    @Column({ nullable: true })
    quantity: number;

    @Column('text',)
    duty: string;

    @Column({ nullable: true, length: 100 })
    years_experience: string;

    @Column({ type: 'double', nullable: true })
    applicant_min_age: number;

    @Column({ type: 'double', nullable: true })
    applicant_max_age: number;

    @Column('text', { nullable: true })
    other_requirement: string;

    @Column({ nullable: true, length: 100 })
    entry_salary: string;

    @Column({ type: 'double', nullable: true })
    exit_salary: number;

    @Column({ length: 100, default: '0' })
    published: string;

    @Column({ default: 'unpublish' })
    status: string;

    @Column({ default: false })
    featured: boolean;

    @Column({ default: false })
    hide: boolean;

    @Column({ nullable: true, length: 100 })
    hidee: string;

    @Column({ nullable: true, length: 100 })
    publish_date: string;




    @Column({ type: 'date' })
    @Transform(({ value }) =>
        value ? new Date(value).toISOString().split('T')[0] : null,
    )
    dead_line: Date;

    @Column({
        type: 'blob',
        nullable: true,
    })
    logo: Buffer;

    @Column({
        length: 100,
        default: '0',
    })
    job_paid_status: string;


    @Column({ type: 'date' })
    @Transform(({ value }) =>
        value ? new Date(value).toISOString().split('T')[0] : null,
    )
    created_at: Date;

    @Column({ type: 'date' })
    @Transform(({ value }) =>
        value ? new Date(value).toISOString().split('T')[0] : null,
    )
    updated_at: Date;

    @DeleteDateColumn({
        name: 'deleted_at',
        nullable: true,
    })
    deleted_at: Date;



    /*
    |--------------------------------------------------------------------------
    | RELATIONSHIPS
    |--------------------------------------------------------------------------
    */

    @ManyToOne(() => Industries)
    @JoinColumn({ name: 'industry_id' })
    industry: Industries;

    @ManyToOne(() => Countries)
    @JoinColumn({ name: 'country_id' })
    country: Countries;

    @ManyToOne(() => Regions)
    @JoinColumn({ name: 'region_id' })
    region: Regions;

    @ManyToOne(() => Genders)
    @JoinColumn({ name: 'gender_id' })
    gender: Genders;


    @ManyToOne(() => Positions, (position) => position.jobs)
    @JoinColumn({ name: 'position_id' })
    position: Positions;

    @ManyToOne(() => PositionLevels)
    @JoinColumn({ name: 'position_level_id' })
    positionLevel: PositionLevels;


    @ManyToOne(() => Contacts)
    @JoinColumn({ name: 'contact_id' })
    contact: Contacts;

    @ManyToOne(() => Currencies)
    @JoinColumn({ name: 'currency_id' })
    currency: Currencies;

    @ManyToOne(() => Clients)
    @JoinColumn({ name: 'client_id' })
    client: Clients;

    @OneToMany(() => JobAddresses, (address) => address.job,)
    addresses: JobAddresses[];

    @OneToMany(() => JobAlerts, (jobAlert) => jobAlert.job,)
    jobAlerts: JobAlerts[];
    @OneToMany(
        () => JobApplicationModals,
        (modal) => modal.job,
    )
    applicationModals: JobApplicationModals[];
    @OneToMany(
        () => JobApplicationOptions,
        (option) => option.job,
    )
    applicationOptions: JobApplicationOptions[];
    @OneToMany(
        () => JobApplicationSubscriptions,
        (subscription) => subscription.job,
    )
    applicationSubscriptions: JobApplicationSubscriptions[];
    @OneToMany(
        () => JobApplyConditions,
        (jac) => jac.job,
    )
    applyConditions: JobApplyConditions[];
    @OneToMany(
        () => JobCarts,
        (cart) => cart.job,
    )
    jobCarts: JobCarts[];
    @OneToMany(
        () => JobCourses, (jobCourse) => jobCourse.job,)
    jobCourses: JobCourses[];

    @OneToMany(
        () => JobCultures, (jobCulture) => jobCulture.job,)
    jobCultures: JobCultures[];

    @OneToMany(() => JobEducation, (jobEducation) => jobEducation.job)
    jobEducation: JobEducation[];

    @OneToMany(() => JobEmails, (jobEmail) => jobEmail.job,)
    jobEmails: JobEmails[];

    @OneToMany(() => JobEvaluationAptitudes, (aptitude) => aptitude.job,)
    evaluationAptitudes: JobEvaluationAptitudes[];

    @OneToMany(() => JobEvaluationSpecifics, (specific) => specific.job,)
    evaluationSpecifics: JobEvaluationSpecifics[];

    @OneToMany(() => JobExternalUrls, (externalUrl) => externalUrl.job,)
    externalUrls: JobExternalUrls[];

    @OneToMany(
        () => JobKnowledge,
        (jobKnowledge) => jobKnowledge.job,
    )
    jobKnowledge: JobKnowledge[];

    @OneToMany(() => JobLanguages, (jl) => jl.job)
    languages: JobLanguages[];

    @OneToMany(
        () => JobLikes,
        (jobLike) => jobLike.job,
    )
    jobLikes: JobLikes[]

    @OneToMany(
        () => JobMajors,
        (jobMajor) => jobMajor.job,
    )
    jobMajors: JobMajors[];

    @OneToMany(() => JobMatchNotifications, (notification) => notification.job,)
    matchNotifications: JobMatchNotifications[];

    @OneToMany(
        () => JobOtherRequirements,
        (otherRequirement) => otherRequirement.job,
    )
    otherRequirements: JobOtherRequirements[];

    @OneToMany(() => JobPersonalities, (jobPersonality) => jobPersonality.job,)
    jobPersonalities: JobPersonalities[];

    @OneToMany(() => JobPlans, (jobPlan) => jobPlan.job,)
    jobPlans: JobPlans[];

    @OneToMany(() => JobMetas, (jobMeta) => jobMeta.job,)
    jobMetas: JobMetas[];

    @OneToMany(
        () => JobPositions, (jobPosition) => jobPosition.job,)
    jobPositions: JobPositions[];

    @OneToMany(() => JobProficiencies, (jobProficiency) => jobProficiency.job,)
    jobProficiencies: JobProficiencies[];

    @OneToMany(() => JobReportTos, (jobReportTo) => jobReportTo.job,)
    jobReportTos: JobReportTos[];

    @OneToMany(() => JobRequirements, (jobRequirement) => jobRequirement.job,)
    jobRequirements: JobRequirements[];

    @OneToMany(() => JobSalaries, (jobSalary) => jobSalary.job,)
    jobSalaries: JobSalaries[];


    @OneToMany(() => JobServiceInfos, (jobServiceInfo) => jobServiceInfo.job,)
    jobServiceInfos: JobServiceInfos[];

    @OneToMany(() => JobShortListings, (shortListing) => shortListing.job,)
    shortListings: JobShortListings[];

    @OneToMany(
        () => JobTypes,
        (jobType) => jobType.job,
    )
    jobTypes: JobTypes[];

    @OneToMany(() => JobStatistics, (stat) => stat.job)
    jobStatistics: JobStatistics[];

    @OneToMany(
        () => JobSoftware,
        (jobSoftware) => jobSoftware.job,
    )
    jobSoftwares: JobSoftware[];

    @OneToMany(() => JobTool, (jobTool) => jobTool.job,)
    jobTools: JobTool[];

    @ManyToOne(() => JobUniversalTypes)
    @JoinColumn({ name: 'type_id' })
    jobUniversalType: JobUniversalTypes;

    @OneToMany(
        () => ApplicantApplication,
        (application) => application.job,
    )
    applications: ApplicantApplication[];

    @OneToMany(() => JobStage, (jobStage) => jobStage.job)
    jobStages: JobStage[];
}