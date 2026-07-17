import { Injectable } from '@nestjs/common';
import { Jobs } from 'src/jobs/entities/job.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Users } from 'src/entities/users.entity';
import { InternalServerErrorException } from '@nestjs/common';
import { NotFoundException } from '@nestjs/common';
import { ApplicantApplication } from 'src/entities/applicants/applicant-applicantions.entity';

export type MyJobsQuery = {
    page?: number;
    limit?: number;
    search?: string;
    industryId?: number;
    status?: 'active' | 'expired' | 'today' | 'all';
    published?: 'published' | 'unpublished' | 'all';
};
@Injectable()
export class EmployerJobsService {
    constructor(
        @InjectRepository(Jobs)
        private readonly jobsRepository: Repository<Jobs>,
        @InjectRepository(ApplicantApplication)
        private readonly applicationRepository: Repository<ApplicantApplication>,
    ) { }

    async myjobs(user: Users, query: MyJobsQuery) {
        const {
            page = 1,
            limit = 20,
            search,
            industryId,
            status = 'all',
            published = 'all',
        } = query;
        try {
            const clientId = user?.client_id;

            if (!clientId) {
                return {
                    success: false,
                    message: 'No client assigned to this user',
                    data: [],
                };
            }

            const query = this.jobsRepository
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

                // 🔥 JOIN APPLICATIONS
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
                .addSelect(`
                    CASE
                        WHEN DATE(job.dead_line) >= CURDATE() THEN 'Active'
                        ELSE 'Expired'
                    END
                `, 'status')

                // 🔥 TOTAL APPLICANTS
                .addSelect('COUNT(applications.id)', 'total_applicants')

                .where('client.id = :clientId', { clientId })
                .orderBy('job.id', 'DESC');
            if (status === 'active') {
                query.andWhere('DATE(job.dead_line) >= CURDATE()');
            }

            if (status === 'expired') {
                query.andWhere('job.dead_line < CURDATE()');
            }

            if (status === 'today') {
                query.andWhere('job.dead_line = CURDATE()');
            }

            if (published === 'published') {
                query.andWhere('job.published = :pub', { pub: '1' });
            }

            if (published === 'unpublished') {
                query.andWhere('job.published = :pub', { pub: '0' });
            }



            // ======================
            // SEARCH FILTER
            // ======================
            if (search && search.trim()) {
                const keyword = `%${search.trim()}%`;

                query.andWhere(
                    `(
          job.title LIKE :keyword OR
          client.client_name LIKE :keyword OR
          position.position_name LIKE :keyword
        )`,
                    { keyword },
                );
            }

            // ======================
            // INDUSTRY FILTER
            // ======================
            if (industryId) {
                query.andWhere('job.industry_id = :industryId', { industryId });
            }


            // ======================
            // GROUP BY (IMPORTANT FIX)
            // ======================
            query
                .groupBy('job.id')
                .addGroupBy('client.id')
                .addGroupBy('position.id')
                .addGroupBy('jobStatistics.id');

            // ======================
            // TOTAL COUNT
            // ======================
            const totalResult = await this.jobsRepository
                .createQueryBuilder('job')
                .leftJoin('job.client', 'client')
                .where('client.id = :clientId', { clientId })
                .select('COUNT(DISTINCT job.id)', 'count')
                .getRawOne();

            const total = Number(totalResult.count);
            const stats = await this.jobsRepository
                .createQueryBuilder('job')
                .leftJoin('job.client', 'client')
                .where('client.id = :clientId', { clientId })
                .select([
                    `COUNT(job.id) AS total_jobs`,

                    `SUM(CASE WHEN job.published = '1' THEN 1 ELSE 0 END) AS published_jobs`,
                    `SUM(CASE WHEN job.published = '0' THEN 1 ELSE 0 END) AS unpublished_jobs`,

                    `SUM(CASE WHEN job.dead_line >= CURDATE() THEN 1 ELSE 0 END) AS active_jobs`,
                    `SUM(CASE WHEN job.dead_line < CURDATE() THEN 1 ELSE 0 END) AS expired_jobs`,
                ])
                .getRawOne();
            // ======================
            // PAGINATION
            // ======================
            const jobs = await query
                .skip((page - 1) * limit)
                .take(limit)
                .getRawAndEntities(); // 🔥 IMPORTANT FIX

            // ======================
            // MERGE total_applicants INTO RESULT
            // ======================
            const formatted = jobs.entities.map((job, index) => {
                return {
                    ...job,
                    status: jobs.raw[index].status,
                    total_applicants: Number(jobs.raw[index]?.total_applicants || 0),
                };
            });

            return {
                success: true,
                message: 'My jobs fetched successfully',
                data: formatted,
                current_page: page,
                per_page: limit,
                total_pages: Math.ceil(total / limit),
                total,
                stats: {
                    total_jobs: Number(stats.total_jobs || 0),
                    published_jobs: Number(stats.published_jobs || 0),
                    unpublished_jobs: Number(stats.unpublished_jobs || 0),
                    active_jobs: Number(stats.active_jobs || 0),
                    expired_jobs: Number(stats.expired_jobs || 0),
                },
            };
        } catch (error) {
            throw new InternalServerErrorException({
                success: false,
                message: 'Failed to fetch jobs',
                error: error.message,
            });
        }
    }

    async myJobDetails(user: Users, jobId: number) {
        try {
            const clientId = user.client_id;

            if (!clientId) {
                throw new NotFoundException('No client assigned to this user');
            }

            const result = await this.jobsRepository
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
                .leftJoinAndSelect('job.currency', 'currency')
                .leftJoinAndSelect('job.jobMetas', 'jobMetas')
                .leftJoinAndSelect('job.jobCultures', 'jobCultures')
                .leftJoinAndSelect('jobCultures.culture', 'culture')
                .leftJoinAndSelect('job.gender', 'gender')
                .leftJoinAndSelect('job.jobEducation', 'jobEducation')
                .leftJoinAndSelect('jobEducation.major', 'major')
                .leftJoinAndSelect('jobEducation.course', 'course')
                .leftJoinAndSelect('jobEducation.educationLevel', 'educationLevel')
                .leftJoinAndSelect('jobMetas.metaKeyword', 'metaKeyword')
                .leftJoinAndSelect('job.jobReportTos', 'jobReportTos')
                .leftJoinAndSelect('job.jobRequirements', 'jobRequirements')
                .leftJoinAndSelect('job.otherRequirements', 'otherRequirements')
                .leftJoinAndSelect('job.jobPersonalities', 'jobPersonalities')
                .leftJoinAndSelect('jobPersonalities.personality', 'personality')

                // Applications
                .leftJoin('job.applications', 'applications')

                .select([
                    'job',

                    'client.id',
                    'client.client_name',
                    'client.logo',

                    'country',
                    'region',
                    'industry',
                    'position',

                    'positionLevel.id',
                    'positionLevel.position_name',

                    'addresses',
                    'jobStatistics',
                    'jobUniversalType',
                    'currency',

                    'jobMetas',
                    'metaKeyword',

                    'jobCultures',
                    'culture',
                    'gender',
                    'jobPersonalities',
                    'personality',

                    'jobEducation',
                    'major',
                    'course',
                    'educationLevel',

                    'jobReportTos',
                    'jobRequirements',
                    'otherRequirements'


                ])

                .addSelect(`
                CASE
                    WHEN DATE(job.dead_line) >= CURDATE() THEN 'Active'
                    ELSE 'Expired'
                END
            `, 'status')

                .addSelect('COUNT(applications.id)', 'total_applicants')

                .where('job.id = :jobId', { jobId })
                .andWhere('client.id = :clientId', { clientId })

                .groupBy('job.id')
                .addGroupBy('client.id')
                .addGroupBy('country.id')
                .addGroupBy('region.id')
                .addGroupBy('industry.id')
                .addGroupBy('position.id')
                .addGroupBy('jobStatistics.id')
                .addGroupBy('jobUniversalType.id')
                .addGroupBy('currency.id')
                .addGroupBy('addresses.id')

                .getRawAndEntities();

            if (!result.entities.length) {
                throw new NotFoundException('Job not found');
            }

            const job = result.entities[0];

            return {
                success: true,
                message: 'Job details fetched successfully',
                data: {
                    ...job,
                    status: result.raw[0].status,
                    total_applicants: Number(
                        result.raw[0].total_applicants ?? 0,
                    ),
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
    
    async myJobDetail(user: Users, jobId: number) {
        try {
            const clientId = user.client_id;

            if (!clientId) {
                throw new NotFoundException(
                    'No client assigned to this user',
                );
            }

            // =========================
            // RUN IN PARALLEL (FAST)
            // =========================
            const [job, totalApplicants] = await Promise.all([
                this.jobsRepository.findOne({
                    where: {
                        id: jobId,
                        client_id: clientId,
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
                    applicant_min_age:job?.applicant_min_age,
                    applicant_max_age:job?.applicant_max_age,
                    hide:job?.hide,
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
