import { HttpException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ApplicantApplication } from 'src/entities/applicants/applicant-applicantions.entity';
import { Jobs } from 'src/jobs/entities/job.entity';
import { Repository } from 'typeorm';
import { MyJobsQuery } from './dto/create-job.dto';

@Injectable()
export class AdminJobsService {

    constructor(
        @InjectRepository(Jobs)
        private readonly jobsRepository: Repository<Jobs>,
        @InjectRepository(ApplicantApplication)
        private readonly applicationRepository: Repository<ApplicantApplication>,
    ) { }

    async jobs(query: MyJobsQuery) {
        const {
            page = 1,
            limit = 20,
            search,
            industryId,
            status = 'all',
            published = 'all',
        } = query;

        try {
            const qb = this.jobsRepository
                .createQueryBuilder('job')

                .leftJoinAndSelect('job.client', 'client')
                .leftJoinAndSelect('job.country', 'country')
                .leftJoinAndSelect('job.region', 'region')
                .leftJoinAndSelect('job.industry', 'industry')
                .leftJoinAndSelect('job.position', 'position')
                .leftJoinAndSelect('job.positionLevel', 'positionLevel')
                .leftJoinAndSelect('job.addresses', 'addresses')
                .leftJoinAndSelect('job.jobStatistics', 'jobStatistics')
                .leftJoinAndSelect('job.jobUniversalType', 'jobUniversalType')

                .leftJoin('job.applications', 'applications')

                .select([
                    'job.id',
                    'job.published',
                    'job.dead_line',
                    'job.quantity',
                    'job.featured',
                    'job.publish_date',
                    'job.created_at',
                    'job.updated_at',

                    'client.id',
                    'client.client_name',
                    'client.logo',

                    'position.id',
                    'position.position_name',

                    'positionLevel.id',
                    'positionLevel.position_name',

                    'jobStatistics.id',
                    'jobStatistics.job_views',
                ])

                .addSelect(
                    `
                CASE
                    WHEN DATE(job.dead_line) >= CURDATE()
                    THEN 'Active'
                    ELSE 'Expired'
                END
                `,
                    'status',
                )

                .addSelect(
                    'COUNT(applications.id)',
                    'total_applicants',
                )

                .orderBy('job.id', 'DESC');

            // STATUS
            if (status === 'active') {
                qb.andWhere(
                    'DATE(job.dead_line) >= CURDATE()',
                );
            }

            if (status === 'expired') {
                qb.andWhere(
                    'job.dead_line < CURDATE()',
                );
            }

            if (status === 'today') {
                qb.andWhere(
                    'DATE(job.dead_line) = CURDATE()',
                );
            }

            // PUBLISHED
            if (published === 'published') {
                qb.andWhere(
                    'job.published = :pub',
                    { pub: '1' },
                );
            }

            if (published === 'unpublished') {
                qb.andWhere(
                    'job.published = :pub',
                    { pub: '0' },
                );
            }

            // SEARCH
            if (search?.trim()) {
                const keyword = `%${search.trim()}%`;

                qb.andWhere(
                    `(
                    job.title LIKE :keyword
                    OR client.client_name LIKE :keyword
                    OR position.position_name LIKE :keyword
                )`,
                    { keyword },
                );
            }

            // INDUSTRY
            if (industryId) {
                qb.andWhere(
                    'job.industry_id = :industryId',
                    { industryId },
                );
            }

            // GROUP BY
            qb
                .groupBy('job.id')
                .addGroupBy('client.id')
                .addGroupBy('position.id')
                .addGroupBy('positionLevel.id')
                .addGroupBy('jobStatistics.id');

            // TOTAL
            const totalResult = await this.jobsRepository
                .createQueryBuilder('job')
                .select('COUNT(DISTINCT job.id)', 'count')
                .getRawOne();

            const total = Number(totalResult.count);

            // STATISTICS
            const stats = await this.jobsRepository
                .createQueryBuilder('job')
                .select([
                    'COUNT(job.id) AS total_jobs',

                    `SUM(
                    CASE
                        WHEN job.published = '1'
                        THEN 1 ELSE 0
                    END
                ) AS published_jobs`,

                    `SUM(
                    CASE
                        WHEN job.published = '0'
                        THEN 1 ELSE 0
                    END
                ) AS unpublished_jobs`,

                    `SUM(
                    CASE
                        WHEN job.dead_line >= CURDATE()
                        THEN 1 ELSE 0
                    END
                ) AS active_jobs`,

                    `SUM(
                    CASE
                        WHEN job.dead_line < CURDATE()
                        THEN 1 ELSE 0
                    END
                ) AS expired_jobs`,
                ])
                .getRawOne();

            // PAGINATION
            const jobs = await qb
                .skip((page - 1) * limit)
                .take(limit)
                .getRawAndEntities();

            // FORMAT
            const formatted = jobs.entities.map(
                (job, index) => ({
                    ...job,

                    status:
                        jobs.raw[index]?.status ?? null,

                    total_applicants:
                        Number(
                            jobs.raw[index]?.total_applicants || 0,
                        ),
                }),
            );

            return {
                success: true,
                message: 'My jobs fetched successfully',

                data: formatted,

                page,
                limit,

                totalPages:
                    Math.ceil(total / limit),

                total,

                stats: {
                    total_jobs:
                        Number(stats.total_jobs || 0),

                    published_jobs:
                        Number(stats.published_jobs || 0),

                    unpublished_jobs:
                        Number(stats.unpublished_jobs || 0),

                    active_jobs:
                        Number(stats.active_jobs || 0),

                    expired_jobs:
                        Number(stats.expired_jobs || 0),
                },
            };

        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }

            throw new InternalServerErrorException({
                success: false,
                message: 'Failed to fetch jobs',
                error: error.message,
            });
        }
    }

    async myJobs(clientId: number, query: MyJobsQuery) {
        const {
            page = 1,
            limit = 20,
            search,
            industryId,
            status = 'all',
            published = 'all',
        } = query;

        try {

            if (!clientId) {
                throw new NotFoundException(
                    'No client assigned to this user',
                );
            }

            const qb = this.jobsRepository
                .createQueryBuilder('job')

                .leftJoinAndSelect('job.client', 'client')
                .leftJoinAndSelect('job.country', 'country')
                .leftJoinAndSelect('job.region', 'region')
                .leftJoinAndSelect('job.industry', 'industry')
                .leftJoinAndSelect('job.position', 'position')
                .leftJoinAndSelect(
                    'job.positionLevel',
                    'positionLevel',
                )
                .leftJoinAndSelect(
                    'job.addresses',
                    'addresses',
                )
                .leftJoinAndSelect(
                    'job.jobStatistics',
                    'jobStatistics',
                )
                .leftJoinAndSelect(
                    'job.jobUniversalType',
                    'jobUniversalType',
                )

                // Applications
                .leftJoin(
                    'job.applications',
                    'applications',
                )

                .select([
                    'job.id',
                    'job.published',
                    'job.dead_line',
                    'job.quantity',
                    'job.featured',
                    'job.publish_date',
                    'job.created_at',
                    'job.updated_at',

                    'client.id',
                    'client.client_name',
                    'client.logo',

                    'country.id',
                    'country.name',

                    'region.id',
                    'region.region_name',

                    'industry.id',
                    'industry.industry_name',

                    'position.id',
                    'position.position_name',

                    'positionLevel.id',
                    'positionLevel.position_name',

                    'addresses.id',
                    'addresses.sub_location',

                    'jobStatistics.id',
                    'jobStatistics.job_views',

                    'jobUniversalType.id',
                    'jobUniversalType.type_name',
                ])

                // IMPORTANT: only jobs belonging to this client
                .where(
                    'client.id = :clientId',
                    { clientId },
                )

                .addSelect(
                    `
                CASE
                    WHEN DATE(job.dead_line) >= CURDATE()
                    THEN 'Active'
                    ELSE 'Expired'
                END
                `,
                    'status',
                )

                .addSelect(
                    'COUNT(applications.id)',
                    'total_applicants',
                )

                .orderBy(
                    'job.id',
                    'DESC',
                );

            // ==========================
            // STATUS FILTER
            // ==========================

            if (status === 'active') {
                qb.andWhere(
                    'DATE(job.dead_line) >= CURDATE()',
                );
            }

            if (status === 'expired') {
                qb.andWhere(
                    'DATE(job.dead_line) < CURDATE()',
                );
            }

            if (status === 'today') {
                qb.andWhere(
                    'DATE(job.dead_line) = CURDATE()',
                );
            }

            // ==========================
            // PUBLISHED FILTER
            // ==========================

            if (published === 'published') {
                qb.andWhere(
                    'job.published = :pub',
                    { pub: '1' },
                );
            }

            if (published === 'unpublished') {
                qb.andWhere(
                    'job.published = :pub',
                    { pub: '0' },
                );
            }

            // ==========================
            // SEARCH
            // ==========================

            if (search?.trim()) {
                const keyword = `%${search.trim()}%`;

                qb.andWhere(
                    `
                (
                    job.title LIKE :keyword
                    OR client.client_name LIKE :keyword
                    OR position.position_name LIKE :keyword
                )
                `,
                    { keyword },
                );
            }

            // ==========================
            // INDUSTRY
            // ==========================

            if (industryId) {
                qb.andWhere(
                    'job.industry_id = :industryId',
                    { industryId },
                );
            }

            // ==========================
            // GROUP BY
            // ==========================

            qb
                .groupBy('job.id')
                .addGroupBy('client.id')
                .addGroupBy('country.id')
                .addGroupBy('region.id')
                .addGroupBy('industry.id')
                .addGroupBy('position.id')
                .addGroupBy('positionLevel.id')
                .addGroupBy('addresses.id')
                .addGroupBy('jobStatistics.id')
                .addGroupBy('jobUniversalType.id');

            // ==========================
            // TOTAL FOR THIS CLIENT
            // ==========================

            const totalResult = await this.jobsRepository
                .createQueryBuilder('job')
                .select(
                    'COUNT(DISTINCT job.id)',
                    'count',
                )
                .where(
                    'job.client_id = :clientId',
                    { clientId },
                )
                .getRawOne();

            const total = Number(
                totalResult?.count || 0,
            );

            // ==========================
            // STATISTICS FOR THIS CLIENT
            // ==========================

            const stats = await this.jobsRepository
                .createQueryBuilder('job')
                .select([
                    'COUNT(job.id) AS total_jobs',

                    `
                SUM(
                    CASE
                        WHEN job.published = '1'
                        THEN 1
                        ELSE 0
                    END
                ) AS published_jobs
                `,

                    `
                SUM(
                    CASE
                        WHEN job.published = '0'
                        THEN 1
                        ELSE 0
                    END
                ) AS unpublished_jobs
                `,

                    `
                SUM(
                    CASE
                        WHEN job.dead_line >= CURDATE()
                        THEN 1
                        ELSE 0
                    END
                ) AS active_jobs
                `,

                    `
                SUM(
                    CASE
                        WHEN job.dead_line < CURDATE()
                        THEN 1
                        ELSE 0
                    END
                ) AS expired_jobs
                `,
                ])
                .where(
                    'job.client_id = :clientId',
                    { clientId },
                )
                .getRawOne();

            // ==========================
            // PAGINATION
            // ==========================

            const jobs = await qb
                .skip((page - 1) * limit)
                .take(limit)
                .getRawAndEntities();

            // ==========================
            // FORMAT
            // ==========================

            const formatted = jobs.entities.map(
                (job, index) => ({
                    ...job,

                    status:
                        jobs.raw[index]?.status ?? null,

                    total_applicants:
                        Number(
                            jobs.raw[index]
                                ?.total_applicants || 0,
                        ),
                }),
            );

            // ==========================
            // RESPONSE
            // ==========================

            return {
                success: true,

                message:
                    'My jobs fetched successfully',

                data: formatted,

                page,
                limit,

                totalPages:
                    Math.ceil(total / limit),

                total,

                stats: {
                    total_jobs:
                        Number(
                            stats?.total_jobs || 0,
                        ),

                    published_jobs:
                        Number(
                            stats?.published_jobs || 0,
                        ),

                    unpublished_jobs:
                        Number(
                            stats?.unpublished_jobs || 0,
                        ),

                    active_jobs:
                        Number(
                            stats?.active_jobs || 0,
                        ),

                    expired_jobs:
                        Number(
                            stats?.expired_jobs || 0,
                        ),
                },
            };

        } catch (error) {

            if (error instanceof HttpException) {
                throw error;
            }

            throw new InternalServerErrorException({
                success: false,
                message: 'Failed to fetch jobs',
                error: error.message,
            });
        }
    }

    async myJobDetail(jobId: number) {
        try {

            // =========================
            // RUN IN PARALLEL (FAST)
            // =========================
            const [job, totalApplicants] = await Promise.all([
                this.jobsRepository.findOne({
                    where: {
                        id: jobId,

                    },
                    // withDeleted: true, include deleted job
                    relations: [
                        'client',
                        'country',
                        'region',
                        'industry',
                        'category',
                        'position',
                        'positionLevel',
                        'addresses',
                        'jobStatistics',
                        'jobUniversalType',
                        'currency',

                        //ADRESS
                        'addresses.region',

                        // META
                        'jobMetas',
                        'jobMetas.metaKeyword',

                        // CULTURE
                        'jobCultures',
                        'jobCultures.culture',

                        //SODTWARE
                        'jobSoftwares',
                        'jobSoftwares.software',

                        //TOOLS
                        'jobTools',
                        'jobTools.tool',

                        //PROFICIENCY
                        'jobProficiencies',
                        'jobProficiencies.proficiency',

                        //LANGUAGES
                        'languages',
                        'languages.speak',
                        'languages.read',
                        'languages.understand',
                        'languages.write',
                        'languages.language',

                        //KNOWLEGD
                        'jobKnowledge',
                        'jobKnowledge.knowledge',

                        //SALARIES
                        'jobSalaries',
                        'jobSalaries.toSalary',
                        'jobSalaries.fromSalary',

                        // PERSONALITIES (FIXED → now returns ALL)
                        'jobPersonalities',
                        'jobPersonalities.personality',

                        // EDUCATION
                        'jobEducation',
                        'jobEducation.major',
                        'jobEducation.course',
                        'jobEducation.educationLevel',

                        // OTHER
                        'gender',
                        'jobReportTos',
                        'jobRequirements',
                        'otherRequirements',

                        //External Job
                        'externalUrls',

                        // Email Jobs
                        'jobEmails',
                    ],
                }),

                this.applicationRepository.count({
                    where: { job_id: jobId },
                }),
            ]);

            // =========================
            // VALIDATION
            // =========================
            if (!job) {
                throw new NotFoundException('Job not found');
            }

            // =========================
            // STATUS LOGIC
            // =========================
            const status =
                new Date(job.dead_line) >= new Date()
                    ? 'Active'
                    : 'Expired';

            // =========================
            // RESPONSE
            // =========================
            return {
                success: true,
                message: 'Job details fetched successfully',
                data: {
                    id: job?.id,
                    title: job?.title,
                    show_client_name: job?.show_client_name,
                    applicant_min_age: job?.applicant_min_age,
                    applicant_max_age: job?.applicant_max_age,
                    hide: job?.hide,
                    quantity: job?.quantity,
                    years_experience: job?.years_experience,
                    published: job?.published,
                    status,
                    dead_line: job?.dead_line,
                    created_at: job?.created_at,
                    updated_at: job?.updated_at,
                    total_applicants: totalApplicants,

                    client: job?.client ? {
                        id: job.client.id,
                        name: job.client.client_name,
                        logo: job.client.logo,
                    } : null,

                    industry: job?.industry ? {
                        id: job.industry.id,
                        name: job.industry.industry_name,
                    } : null,
                    category: job?.category ? {
                        id: job.category.id,
                        name: job.category.industry_name,
                    } : null,

                    position: job?.position ? {
                        id: job.position.id,
                        name: job.position.position_name,
                    } : null,

                    position_level: job?.positionLevel ? {
                        id: job.positionLevel.id,
                        name: job.positionLevel.position_name,
                    } : null,

                    country: job?.country ? {
                        id: job.country.id,
                        name: job.country.name,
                    } : null,

                    region: job?.region ? {
                        id: job.region.id,
                        name: job.region.region_name,
                    } : null,

                    currency: job?.currency,

                    addresses: (job?.addresses || []).map(address => ({
                        id: address?.id,
                        sub_location: address?.sub_location,
                        region: address?.region?.region_name || null, // Safe access with fallback
                    })),

                    statistics: job?.jobStatistics || [],

                    // job_type: job?.jobUniversalType,

                    job_type: job?.jobUniversalType ? {
                        id: job.jobUniversalType.id,
                        name: job.jobUniversalType.type_name,
                    } : null,

                    job_email: job?.jobEmails ? {
                        id: job.jobEmails.id,
                        name: job.jobEmails.email,
                    } : null,

                    job_externalUrl: job?.externalUrls ? {
                        id: job.externalUrls.id,
                        name: job.externalUrls.external_url,
                    } : null,



                    gender: job?.gender ? {
                        id: job.gender.id,
                        name: job.gender.gender_name,
                    } : null,

                    meta_keywords: (job?.jobMetas || []).map(item => ({
                        id: item?.id,
                        keyword: item?.metaKeyword ? {
                            id: item.metaKeyword.id,
                            name: item.metaKeyword.name,
                        } : null,
                    })),

                    cultures: (job?.jobCultures || []).map(item => ({
                        id: item?.id,
                        culture: item?.culture ? {
                            id: item.culture.id,
                            name: item.culture.culture_name,
                        } : null,
                    })),

                    personalities: (job?.jobPersonalities || []).map(item => ({
                        id: item?.id,
                        personality: item?.personality ? {
                            id: item.personality.id,
                            name: item.personality.personality_name,
                        } : null,
                    })),

                    softwares: (job?.jobSoftwares || []).map(item => ({
                        id: item?.id,
                        software: item?.software ? {
                            id: item.software.id,
                            name: item.software.software_name,
                        } : null,
                    })),

                    tools: (job?.jobTools || []).map(item => ({
                        id: item?.id,
                        tool: item?.tool ? {
                            id: item.tool.id,
                            name: item.tool.tool_name,
                        } : null,
                    })),

                    proficiencies: (job?.jobProficiencies || []).map(item => ({
                        id: item?.id,
                        proficiency: item?.proficiency ? {
                            id: item.proficiency.id,
                            name: item.proficiency.proficiency_name,
                        } : null,
                    })),

                    knowledge: (job?.jobKnowledge || []).map(item => ({
                        id: item?.id,
                        knowledge: item?.knowledge ? {
                            id: item.knowledge.id,
                            name: item.knowledge.knowledge_name,
                        } : null,
                    })),

                    salaries: (job?.jobSalaries || []).map(salary => ({
                        id: salary?.id,
                        from_salary: salary?.fromSalary ? {
                            id: salary.fromSalary.id,
                            low: salary.fromSalary.low,
                            high: salary.fromSalary.high,
                        } : null,
                        to_salary: salary?.toSalary ? {
                            id: salary.toSalary.id,
                            low: salary.toSalary.low,
                            high: salary.toSalary.high,
                        } : null,
                    })),

                    education: (job?.jobEducation || []).map(item => ({
                        id: item?.id,
                        education_level: item?.educationLevel ? {
                            id: item.educationLevel.id,
                            name: item.educationLevel.education_level,
                        } : null,
                        course: item?.course ? {
                            id: item.course.id,
                            name: item.course.course_name,
                        } : null,
                        major: item?.major ? {
                            id: item.major.id,
                            name: item.major.name,
                        } : null,
                    })),

                    languages: (job?.languages || []).map(language => ({
                        id: language?.id,
                        language: language?.language ? {
                            id: language.language.id,
                            name: language.language.language_name,
                        } : null,
                        read: language?.read ? {
                            id: language.read.id,
                            name: language.read.read_ability,
                        } : null,
                        write: language?.write ? {
                            id: language.write.id,
                            name: language.write.write_ability,
                        } : null,
                        speak: language?.speak ? {
                            id: language.speak.id,
                            name: language.speak.speak_ability,
                        } : null,
                        understand: language?.understand ? {
                            id: language.understand.id,
                            name: language.understand.understand_ability,
                        } : null,
                    })),

                    report_to: job?.jobReportTos || [],
                    requirements: job?.jobRequirements || [],
                    other_requirements: job?.otherRequirements || [],
                },
            };
        } catch (error) {
            throw new InternalServerErrorException({
                success: false,
                message: 'Failed to fetch job details',
                error: error.message,
            });
        }
    }
}
