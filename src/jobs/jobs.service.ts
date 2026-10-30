import {
    Injectable,
    NotFoundException,
    InternalServerErrorException,
    ForbiddenException,
    HttpException,
    HttpStatus,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Brackets, DataSource, QueryRunner } from 'typeorm';

import { Jobs } from './entities/job.entity';
import { CreateJobDto } from './dtos/create-job.dto';
import { UpdateJobDto } from './dtos/update-job.dto';
import { Clients } from 'src/client/clients.entity';

import { JobCultures } from './entities/job-cultures.entity';
import { JobPersonalities } from './entities/job-personalities.entity';
import { JobSoftware } from './entities/job-software.entity';
import { JobTool } from './entities/job-tool.entity';
import { JobKnowledge } from './entities/job-knowledge.entity';
import { JobProficiencies } from './entities/job-proficiencies.entity';
import { JobAddresses } from './entities/job-addresses.entity';
import { Positions } from 'src/entities/positions.entity';
import { BadRequestException } from '@nestjs/common';
import { CompleteJobProfileDto } from './dtos/complete-job-profile.dto';
import { generateSlug } from 'src/utils/slug';
import { JobSalaries } from './entities/job-salaries.entity';
import { Users } from 'src/entities/users.entity';
import { ApplicantApplication } from 'src/entities/applicants/applicant-applicantions.entity';
import { JobStatistics } from './entities/job-statistics.entity';

@Injectable()
export class JobsService {
    constructor(
        @InjectRepository(Jobs)
        private readonly jobsRepository: Repository<Jobs>,

        @InjectRepository(Clients)
        private readonly clientRepository: Repository<Clients>,
        @InjectRepository(JobStatistics)
        private readonly jobStatisticRepo: Repository<JobStatistics>,

        @InjectRepository(JobCultures)
        private readonly jobCultureRepository: Repository<JobCultures>,

        @InjectRepository(JobPersonalities)
        private readonly jobPersonalityRepository: Repository<JobPersonalities>,

        @InjectRepository(JobSoftware)
        private readonly jobSoftwareRepository: Repository<JobSoftware>,

        @InjectRepository(JobTool)
        private readonly jobToolRepository: Repository<JobTool>,

        @InjectRepository(JobKnowledge)
        private readonly jobKnowledgeRepository: Repository<JobKnowledge>,

        @InjectRepository(JobProficiencies)
        private readonly jobProficiencyRepository: Repository<JobProficiencies>,

        @InjectRepository(ApplicantApplication)
        private readonly applicationRepository: Repository<ApplicantApplication>,

        @InjectRepository(JobAddresses)
        private readonly jobAddressRepository: Repository<JobAddresses>,

        private readonly dataSource: DataSource,
    ) { }

    // =========================
    // CREATE
    // =========================
    async create(user: Users, createJobDto: CreateJobDto) {
        if (!user.client_id) {
            throw new BadRequestException(

                {
                    success: false,
                    mesage: 'User is not linked to a client'
                }
            );
        }


        const client = await this.clientRepository.findOne({
            where: {
                id: user.client_id,
            },
        });
        if (!client) {
            throw new NotFoundException(

                {
                    success: false,
                    mesage: 'Client not found'
                }
            );
        }

        const queryRunner = this.dataSource.createQueryRunner();

        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            let positionId = createJobDto.position_id;

            // ✅ STEP 1: Check if position_id is string → create position
            if (typeof positionId === 'string') {
                const positionName = positionId.trim();

                let position = await queryRunner.manager.findOne(Positions, {
                    where: { position_name: positionName },
                });

                // If not exists → create it
                if (!position) {
                    position = await queryRunner.manager.save(Positions, {
                        position_name: positionName,
                        slug: generateSlug(positionName), // ✅ HERE
                        creator_id: user.id ?? null,
                        updator_id: user.id ?? null,
                        industry_id: createJobDto.industry_id ?? null,
                        hide: 0,
                        created_at: new Date(),
                        updated_at: new Date(),
                    });
                }

                positionId = position.id;
            }

            // Optional: ensure number
            if (!positionId) {
                throw new BadRequestException(

                    {
                        succcess: false,
                        message: 'Position is required'
                    }
                );
            }

            // ✅ STEP 2: Create Job
            const job = await queryRunner.manager.save(Jobs, {
                ...createJobDto,
                position_id: positionId,
                client_id: user.client_id,
                creator_id: user.id,
                updator_id: user.id,
                stage_id: 1,
                status: createJobDto.status ?? 'unpublish',
                created_at: new Date(),
                updated_at: new Date(),
            });

            // ✅ STEP 3: Save Job Address
            await queryRunner.manager.save(JobAddresses, {
                job_id: job.id,
                region_id: createJobDto.region_id,
                sub_location: createJobDto.sub_location,
            });

            await queryRunner.commitTransaction();

            return {
                success: true,
                message: 'Job created successfully',
                data: job,
            };

        } catch (error) {

            await queryRunner.rollbackTransaction();

            console.error(error);

            throw new HttpException(
                {
                    success: false,
                    message: 'Failed to process  job application',
                    error: error.message,
                },
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        } finally {
            await queryRunner.release();
        }
    }

    // =========================
    // FIND ALL
    // =========================






    async findAll(
        page = 1,
        limit = 20,
        search?: string,
        industryId?: number,
        onlyActive: boolean = true,
    ) {
        try {
            page = Math.max(1, Number(page) || 1);
            limit = Math.max(1, Number(limit) || 20);

            // ======================
            // MAIN QUERY
            // ======================
            const query = this.jobsRepository
                .createQueryBuilder('job')
                .leftJoinAndSelect('job.client', 'client')
                .leftJoinAndSelect('job.country', 'country')
                .leftJoinAndSelect('job.region', 'region')
                .leftJoinAndSelect('job.industry', 'industry')
                .leftJoinAndSelect('job.position', 'position')
                .leftJoinAndSelect('job.jobMetas', 'jobMetas')
                .leftJoinAndSelect('job.addresses', 'addresses')
                .leftJoinAndSelect('job.jobStatistics', 'jobStatistics')
                .leftJoinAndSelect('job.jobUniversalType', 'jobUniversalType')
                .select([
                    'job.id',
                    'job.status',
                    'job.published',
                    'job.dead_line',
                    'job.quantity',
                    'job.featured',
                    'job.publish_date',

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

                    'jobStatistics.id',
                    'jobStatistics.job_views',

                    'jobUniversalType.id',
                    'jobUniversalType.type_name',

                    'addresses.id',
                    'addresses.sub_location',
                ]);

            // ======================
            // FILTER ACTIVE JOBS
            // ======================
            // // if (onlyActive) {
            // query
            //     .andWhere('job.published = :published', {
            //         published: '1',
            //     })
            //     // .andWhere('job.dead_line > CURDATE()');
            // // }
            query.andWhere('job.published = :published', {
                published: '1',
            });

            // if (onlyActive) {
            // query.andWhere('job.dead_line > CURDATE()');
            // }

            // ======================
            // SEARCH FILTER
            // ======================
            if (search?.trim()) {
                const keyword = `%${search.trim()}%`;

                query.andWhere(
                    `(
                    job.title LIKE :keyword OR
                    client.client_name LIKE :keyword OR
                    country.name LIKE :keyword OR
                    region.region_name LIKE :keyword OR
                    industry.industry_name LIKE :keyword OR
                    position.position_name LIKE :keyword OR
                    jobUniversalType.type_name LIKE :keyword OR
                    addresses.sub_location LIKE :keyword
                )`,
                    { keyword },
                );
            }

            // ======================
            // INDUSTRY FILTER
            // ======================
            if (industryId) {
                query.andWhere('job.industry_id = :industryId', {
                    industryId,
                });
            }

            query.orderBy('job.id', 'DESC');

            // ======================
            // COUNT QUERY
            // Apply exactly the same filters
            // ======================
            const totalQuery = this.jobsRepository
                .createQueryBuilder('job')
                .leftJoin('job.client', 'client')
                .leftJoin('job.country', 'country')
                .leftJoin('job.region', 'region')
                .leftJoin('job.industry', 'industry')
                .leftJoin('job.position', 'position')
                .leftJoin('job.addresses', 'addresses')
                .leftJoin('job.jobUniversalType', 'jobUniversalType');

            // Count active jobs only
            // totalQuery
            //     .andWhere('job.published = :published', {
            //         published: '1',
            //     })
            //     .andWhere('job.dead_line > CURDATE()');
            totalQuery.andWhere('job.published = :published', {
                published: '1',
            });

            // if (onlyActive) {
            // totalQuery.andWhere('job.dead_line > CURDATE()');
            // }

            if (search?.trim()) {
                const keyword = `%${search.trim()}%`;

                totalQuery.andWhere(
                    `(
            job.title LIKE :keyword OR
            client.client_name LIKE :keyword OR
            country.name LIKE :keyword OR
            region.region_name LIKE :keyword OR
            industry.industry_name LIKE :keyword OR
            position.position_name LIKE :keyword OR
            jobUniversalType.type_name LIKE :keyword OR
            addresses.sub_location LIKE :keyword
        )`,
                    { keyword },
                );
            }

            if (industryId) {
                totalQuery.andWhere('job.industry_id = :industryId', {
                    industryId,
                });
            }

            const totalResult = await totalQuery
                .select('COUNT(DISTINCT job.id)', 'count')
                .getRawOne();

            const total = Number(totalResult?.count ?? 0);

            // ======================
            // PAGINATION
            // ======================

            const jobs = await query
                .skip((page - 1) * limit)
                .take(limit)
                .getMany();

            const formattedJobs = jobs.map((job) => ({
                id: job.id,
                title: job.title,
                quantity: job.quantity,
                published: job.published,
                status: job.status,
                featured: job.featured,
                publish_date: job.publish_date,
                dead_line: job.dead_line,

                client: job.client
                    ? {
                        id: job.client.id,
                        name: job.client.client_name,
                        logo: job.client.logo,
                    }
                    : null,

                industry: job.industry
                    ? {
                        id: job.industry.id,
                        name: job.industry.industry_name,
                    }
                    : null,

                position: job.position
                    ? {
                        id: job.position.id,
                        name: job.position.position_name,
                    }
                    : null,

                country: job.country
                    ? {
                        id: job.country.id,
                        name: job.country.name,
                    }
                    : null,

                region: job.region
                    ? {
                        id: job.region.id,
                        name: job.region.region_name,
                    }
                    : null,

                addresses: (job.addresses || []).map((address) => ({
                    id: address.id,
                    sub_location: address.sub_location,
                })),

                statistics: job.jobStatistics || [],

                type: job.jobUniversalType
                    ? {
                        id: job.jobUniversalType.id,
                        name: job.jobUniversalType.type_name,
                    }
                    : null,

                metas: job.jobMetas || [],
            }));

            return {
                success: true,
                message: 'Jobs fetched successfully',
                data: formattedJobs,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
                total,
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


    // =========================
    // FIND ONE
    // =========================
    async findOne(id: number) {
        const job = await this.jobsRepository
            .createQueryBuilder('job')
            //.withDeleted() include deleted job
            // .where('job.deleted_at IS NOT NULL')

            // ======================
            // RELATIONS
            // ======================

            .leftJoinAndSelect('job.country', 'country')
            .leftJoinAndSelect('job.region', 'region')
            .leftJoinAndSelect('job.industry', 'industry')
            .leftJoinAndSelect('job.position', 'position')
            .leftJoinAndSelect('job.addresses', 'addresses')
            .leftJoinAndSelect('job.positionLevel', 'positionLevel')
            .leftJoinAndSelect('job.currency', 'currency')
            .leftJoinAndSelect('job.jobSalaries', 'jobSalaries')
            .leftJoinAndSelect('jobSalaries.fromSalary', 'fromSalary')
            .leftJoinAndSelect('jobSalaries.toSalary', 'toSalary')

            .leftJoinAndSelect('job.jobUniversalType', 'jobUniversalType')

            // ======================
            // SELECT
            // ======================
            .select([
                'job.id',
                'job.dead_line',
                'job.quantity',

                'positionLevel.id',
                'positionLevel.position_name',

                'currency.id',
                'currency.currency_name',

                'jobSalaries.id',

                'fromSalary.id',
                'fromSalary.low',
                'fromSalary.high',

                'toSalary.id',
                'toSalary.low',
                'toSalary.high',

                'country.id',
                'country.name',

                'region.id',
                'region.region_name',

                'industry.id',
                'industry.industry_name',

                'position.id',
                'position.position_name',

                'jobUniversalType.id',
                'jobUniversalType.type_name',

                'addresses.id',
                'addresses.sub_location',


            ])

            .where('job.id = :id', { id })
            .getOne();

        if (!job) {
            throw new NotFoundException('Job not found');
        }

        return {
            success: true,
            message: 'Job retrieved successfully 2000',
            data: job,
        };
    }
    async JobDetail(jobId: number) {
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




    async incrementJob(jobId: number) {
        const job = await this.jobsRepository.findOne({
            where: { id: jobId },
            select: ['id'],
        });

        if (!job) {
            throw new NotFoundException('Job not found.');
        }

        // Increment existing record.
        const result = await this.dataSource.query(
            `
    UPDATE job_statistics
    SET
      job_views = COALESCE(job_views, 0) + 1,
      updated_at = NOW()
    WHERE job_id = ?
    `,
            [jobId],
        );

        // Create a record only if one does not exist.
        if (result.affectedRows === 0) {
            await this.dataSource.query(
                `
      INSERT INTO job_statistics
        (job_id, job_views, created_at, updated_at)
      VALUES (?, 1, NOW(), NOW())
      `,
                [jobId],
            );
        }

        const [statistic] = await this.dataSource.query(
            `
    SELECT job_views
    FROM job_statistics
    WHERE job_id = ?
    LIMIT 1
    `,
            [jobId],
        );

        return {
            success: statistic ? Number(statistic.job_views) : 0,
        };
    }





    // =========================
    // UPDATE JOB
    // =========================
    async update(id: number,
        dto: UpdateJobDto,
        user: Users,
    ) {
        const existingJob = await this.jobsRepository.findOne({
            where: { id },
        });

        if (!existingJob) {
            throw new NotFoundException('Job not found');
        }
        if (!user.client_id) {
            throw new BadRequestException(
                'User is not linked to client',
            );
        }

        const queryRunner = this.dataSource.createQueryRunner();

        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            // =========================
            // POSITION (auto create)
            // =========================
            const positionId = await this.getOrCreatePosition(
                dto.position_id,
                queryRunner,
                user.client_id,
                dto.industry_id ?? existingJob.industry_id,
            );

            // =========================
            // SPLIT DTO SAFELY
            // =========================
            const {
                from_salary,
                to_salary,
                region_id,
                sub_location,
                ...jobData
            } = dto;

            // =========================
            // UPDATE JOBS TABLE
            // =========================
            await queryRunner.manager.update(
                Jobs,
                { id },
                {
                    ...jobData,
                    updator_id: user.id,
                    position_id: positionId,
                    updated_at: new Date(),
                },
            );

            // =========================
            // UPDATE / CREATE ADDRESS
            // =========================
            if (region_id !== undefined || sub_location !== undefined) {
                const address = await queryRunner.manager.findOne(JobAddresses, {
                    where: { job_id: id },
                });

                if (address) {
                    await queryRunner.manager.update(
                        JobAddresses,
                        { job_id: id },
                        {
                            region_id,
                            sub_location,
                        },
                    );
                } else {
                    await queryRunner.manager.save(JobAddresses, {
                        job_id: id,
                        region_id,
                        sub_location,
                    });
                }
            }

            // =========================
            // UPDATE / CREATE SALARY
            // =========================
            if (from_salary !== undefined || to_salary !== undefined) {
                const salary = await queryRunner.manager.findOne(JobSalaries, {
                    where: { job_id: id },
                });

                if (salary) {
                    await queryRunner.manager.update(
                        JobSalaries,
                        { job_id: id },
                        {
                            from_salary,
                            to_salary,
                            updated_at: new Date(),
                        },
                    );
                } else {
                    await queryRunner.manager.save(JobSalaries, {
                        job_id: id,
                        from_salary,
                        to_salary,
                        created_at: new Date(),
                        updated_at: new Date(),
                    });
                }
            }

            await queryRunner.commitTransaction();

            return await this.findOne(id);

        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }
    }

    // =========================
    // DELETE JOB
    // =========================
    // async remove(id: number) {
    //     const job = await this.jobsRepository.findOne({
    //         where: { id },
    //     });

    //     if (!job) {
    //         throw new NotFoundException('Job not found');
    //     }

    //     await this.jobsRepository.remove(job);

    //     return {
    //         success: true,
    //         message: 'Job deleted successfully',
    //     };
    // }
    async remove(
        user: Users,
        id: number,
    ) {

        const job = await this.jobsRepository.findOne({
            where: {
                id,
            },
        });

        if (!job) {
            throw new NotFoundException(
                {
                    success: false,
                    message: 'Job not found',
                }
            );
        }

        // Ensure the logged-in user owns this job
        if (job.creator_id !== user.id) {
            throw new ForbiddenException(
                {
                    success: false,
                    message: 'You are not allowed to delete this job',
                }

            );
        }

        await this.jobsRepository.softDelete(id);

        return {
            success: true,
            message: 'Job deleted successfully',
        };
    }

    async restore(
        user: Users,
        id: number,
    ) {

        const job = await this.jobsRepository.findOne({
            where: {
                id,
            },
            withDeleted: true, // include soft deleted jobs
        });


        if (!job) {
            throw new NotFoundException({
                success: false,
                message: 'Job not found',
            });
        }


        // Check ownership
        if (job.creator_id !== user.id) {
            throw new ForbiddenException({
                success: false,
                message: 'You are not allowed to restore this job',
            });
        }


        if (!job.deleted_at) {
            return {
                success: false,
                message: 'Job is already active',
            };
        }


        await this.jobsRepository.restore(id);


        return {
            success: true,
            message: 'Job restored successfully',
        };
    }


    async togglePublish(
        user: Users,
        jobId: number,
    ) {

        const job = await this.jobsRepository.findOne({
            where: {
                id: jobId,
            },
        });


        if (!job) {
            throw new NotFoundException({
                success: false,
                message: 'Job not found',
            });
        }


        // Check ownership
        if (job.creator_id !== user.id) {
            throw new ForbiddenException({
                success: false,
                message: 'You are not allowed to publish this job',
            });
        }


        // Toggle publish status
        if (job.published === '1') {

            job.published = '0';
            job.featured = true;
            job.status = 'unpublished';

        } else {

            job.published = '1';
            job.featured = true;
            job.status = 'published';

        }


        await this.jobsRepository.save(job);


        return {
            success: true,
            message: job.status === 'published'
                ? 'Job published successfully'
                : 'Job unpublished successfully',

            data: {
                id: job.id,
                published: job.published,
                status: job.status,
            },
        };
    }


    private async getOrCreatePosition(
        position: number | string,
        queryRunner: QueryRunner,
        clientId: number,
        industryId: number,
    ): Promise<number> {

        // If it's already an ID, use it
        if (typeof position === 'number') {
            return position;
        }

        // Handle numeric string (e.g. "5")
        if (!isNaN(Number(position))) {
            return Number(position);
        }

        const positionName = position.trim();

        let existingPosition = await queryRunner.manager.findOne(Positions, {
            where: {
                position_name: positionName,
            },
        });

        if (!existingPosition) {
            existingPosition = await queryRunner.manager.save(Positions, {
                position_name: positionName,
                slug: generateSlug(positionName),
                creator_id: clientId,
                updator_id: clientId,
                industry_id: industryId,
                hide: 0,
                created_at: new Date(),
                updated_at: new Date(),
            });
        }

        return existingPosition.id;
    }

    // =========================
    // COMPLETE PROFILE
    // =========================
    async completeProfile(
        user: Users,
        jobId: number,
        dto: CompleteJobProfileDto,
    ) {

        const queryRunner =
            this.jobsRepository.manager.connection.createQueryRunner();

        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {

            const job = await queryRunner.manager.findOne(Jobs, {
                where: {
                    id: jobId,
                    creator_id: user.id,
                },
            });


            if (!job) {
                throw new NotFoundException({
                    success: false,
                    message: 'Job not found or unauthorized',
                });
            }

            // UPDATE JOB MAIN FIELDS
            await queryRunner.manager.update(Jobs, jobId, {
                ...(dto.gender_id !== undefined && {
                    gender_id: dto.gender_id,
                }),
                ...(dto.years_experience !== undefined && {
                    years_experience: dto.years_experience,
                }),
                ...(dto.applicant_min_age !== undefined && {
                    applicant_min_age: dto.applicant_min_age,
                }),
                ...(dto.applicant_max_age !== undefined && {
                    applicant_max_age: dto.applicant_max_age,
                }),
            });

            // DELETE OLD RELATIONS
            await Promise.all([
                queryRunner.manager.delete(JobCultures, { job_id: jobId }),
                queryRunner.manager.delete(JobPersonalities, { job_id: jobId }),
                queryRunner.manager.delete(JobSoftware, { job_id: jobId }),
                queryRunner.manager.delete(JobTool, { job_id: jobId }),
                queryRunner.manager.delete(JobKnowledge, { job_id: jobId }),
                queryRunner.manager.delete(JobProficiencies, { job_id: jobId }),
            ]);

            // CULTURES
            if (dto.culture_ids?.length) {
                await queryRunner.manager.save(
                    JobCultures,
                    dto.culture_ids.map((culture_id) => ({
                        job_id: jobId,
                        culture_id,
                        created_at: new Date(),
                        updated_at: new Date(),
                    })),
                );
            }

            // PERSONALITIES
            if (dto.personality_ids?.length) {
                await queryRunner.manager.save(
                    JobPersonalities,
                    dto.personality_ids.map((personality_id) => ({
                        job_id: jobId,
                        personality_id,
                        created_at: new Date(),
                        updated_at: new Date(),
                    })),
                );
            }

            // SOFTWARE
            if (dto.software_ids?.length) {
                await queryRunner.manager.save(
                    JobSoftware,
                    dto.software_ids.map((software_id) => ({
                        job_id: jobId,
                        software_id,
                        created_at: new Date(),
                        updated_at: new Date(),
                    })),
                );
            }

            // TOOLS
            if (dto.tool_ids?.length) {
                await queryRunner.manager.save(
                    JobTool,
                    dto.tool_ids.map((tool_id) => ({
                        job_id: jobId,
                        tool_id,
                        user_id: user.id,
                        hide: 0,
                        created_at: new Date(),
                        updated_at: new Date(),
                    }))
                );
            }

            // KNOWLEDGE
            if (dto.knowledge_ids?.length) {
                await queryRunner.manager.save(
                    JobKnowledge,
                    dto.knowledge_ids.map((knowledge_id) => ({
                        job_id: jobId,
                        knowledge_id,
                        created_at: new Date(),
                        updated_at: new Date(),
                    })),
                );
            }

            // PROFICIENCIES
            if (dto.proficiency_ids?.length) {
                await queryRunner.manager.save(
                    JobProficiencies,
                    dto.proficiency_ids.map((proficiency_id) => ({
                        job_id: jobId,
                        proficiency_id,
                        created_at: new Date(),
                        updated_at: new Date(),
                    })),
                );
            }

            await queryRunner.commitTransaction();

            return {
                success: true,
                message: 'Job profile completed successfully',
            };
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }
    }

    // =========================
    // GET COMPLETE PROFILE
    // =========================
    async getCompleteProfile(jobId: number) {
        const job = await this.jobsRepository
            .createQueryBuilder('job')
            .leftJoinAndSelect('job.jobCultures', 'jobCultures')
            .leftJoinAndSelect('jobCultures.culture', 'culture')
            .leftJoinAndSelect('job.jobPersonalities', 'jobPersonalities')
            .leftJoinAndSelect('jobPersonalities.personality', 'personality')
            .leftJoinAndSelect('job.jobSoftwares', 'jobSoftwares')
            .leftJoinAndSelect('jobSoftwares.software', 'software')
            .leftJoinAndSelect('job.jobTools', 'jobTools')
            .leftJoinAndSelect('jobTools.tool', 'tool')
            .leftJoinAndSelect('job.jobKnowledge', 'jobKnowledge')
            .leftJoinAndSelect('jobKnowledge.knowledge', 'knowledge')
            .leftJoinAndSelect('job.jobProficiencies', 'jobProficiencies')
            .leftJoinAndSelect('jobProficiencies.proficiency', 'proficiency')
            .where('job.id = :jobId', { jobId })
            .getOne();

        if (!job) {
            throw new NotFoundException('Job not found');
        }

        return {
            success: true,
            data: job,
        };
    }

    // =========================
    // DELETE COMPLETE PROFILE
    // =========================
    async deleteCompleteProfile(jobId: number) {
        const job = await this.findOne(jobId);

        await Promise.all([
            this.jobCultureRepository.delete({ job_id: jobId }),
            this.jobPersonalityRepository.delete({ job_id: jobId }),
            this.jobSoftwareRepository.delete({ job_id: jobId }),
            this.jobToolRepository.delete({ job_id: jobId }),
            this.jobKnowledgeRepository.delete({ job_id: jobId }),
            this.jobProficiencyRepository.delete({ job_id: jobId }),
        ]);

        await this.jobsRepository.update(jobId, {
            gender_id: null as any,
            years_experience: null as any,
            applicant_min_age: null as any,
            applicant_max_age: null as any,
        });

        return {
            success: true,
            message: 'Job profile deleted was successfully ',
        };
    }
}