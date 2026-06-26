import {
    Injectable,
    NotFoundException,
    InternalServerErrorException,
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

@Injectable()
export class JobsService {
    constructor(
        @InjectRepository(Jobs)
        private readonly jobsRepository: Repository<Jobs>,

        @InjectRepository(Clients)
        private readonly clientRepository: Repository<Clients>,

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




        @InjectRepository(JobAddresses)
        private readonly jobAddressRepository: Repository<JobAddresses>,

        private readonly dataSource: DataSource,
    ) { }

    // =========================
    // CREATE
    // =========================
    async create(createJobDto: CreateJobDto) {
        const client = await this.clientRepository.findOne({
            where: { id: createJobDto.client_id },
        });

        if (!client) {
            throw new NotFoundException('Client not found');
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
                        creator_id: createJobDto.client_id ?? 1,
                        updator_id: createJobDto.client_id ?? 1,
                        industry_id: createJobDto.industry_id ?? 1,
                        hide: 0,
                        created_at: new Date(),
                        updated_at: new Date(),
                    });
                }

                positionId = position.id;
            }

            // Optional: ensure number
            if (!positionId) {
                throw new BadRequestException('Position is required');
            }

            // ✅ STEP 2: Create Job
            const job = await queryRunner.manager.save(Jobs, {
                ...createJobDto,
                position_id: positionId,
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
            throw error;
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
            const query = this.jobsRepository
                .createQueryBuilder('job')

                // ======================
                // JOINS
                // ======================
                .leftJoinAndSelect('job.client', 'client')
                .leftJoinAndSelect('job.country', 'country')
                .leftJoinAndSelect('job.region', 'region')
                .leftJoinAndSelect('job.industry', 'industry')
                .leftJoinAndSelect('job.position', 'position')
                .leftJoinAndSelect('job.jobMetas', 'jobMetas')
                .leftJoinAndSelect('job.addresses', 'addresses')
                .leftJoinAndSelect('job.jobStatistics', 'jobStatistics')
                .leftJoinAndSelect('job.jobUniversalType', 'jobUniversalType')

                // ======================
                // SELECT
                // ======================
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
                ])

                .orderBy('job.id', 'DESC');
            query.andWhere('job.published = :published', { published: '1' });
            query.andWhere('job.dead_line > CURDATE()');

            // ======================
            // 🔎 SEARCH FILTER
            // ======================
            if (search && search.trim() !== '') {
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
            // 🏭 INDUSTRY FILTER
            // ======================
            if (industryId) {
                query.andWhere('job.industry_id = :industryId', { industryId });
            }

            // ======================
            // ⏳ ACTIVE JOB FILTER
            // published = 1 AND not expired
            // ======================
            if (onlyActive) {
                query.andWhere('job.published = :published', { published: '1' });
                query.andWhere('job.dead_line > CURDATE()');
            }

            // ======================
            // COUNT QUERY
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

            if (search && search.trim() !== '') {
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
                totalQuery.andWhere('job.industry_id = :industryId', { industryId });
            }

            if (onlyActive) {
                totalQuery.andWhere('job.published = :published', { published: '1' });
                totalQuery.andWhere('job.dead_line > CURDATE()');
            }

            const totalResult = await totalQuery
                .select('COUNT(DISTINCT job.id)', 'count')
                .getRawOne();

            const total = Number(totalResult.count);

            // ======================
            // PAGINATION
            // ======================
            const jobs = await query
                .skip((page - 1) * limit)
                .take(limit)
                .getMany();

            return {
                success: true,
                message: 'Jobs fetched successfully',
                data: jobs,
                current_page: page,
                per_page: limit,
                total_pages: Math.ceil(total / limit),
                total,
            };
        } catch (error) {
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

    // =========================
    // UPDATE JOB
    // =========================
    async update(id: number, dto: UpdateJobDto) {
        const existingJob = await this.jobsRepository.findOne({
            where: { id },
        });

        if (!existingJob) {
            throw new NotFoundException('Job not found');
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
                dto.client_id ?? existingJob.client_id,
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
    async remove(id: number) {
        const job = await this.jobsRepository.findOne({
            where: { id },
        });

        if (!job) {
            throw new NotFoundException('Job not found');
        }

        await this.jobsRepository.remove(job);

        return {
            success: true,
            message: 'Job deleted successfully',
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
    async completeProfile(jobId: number, dto: CompleteJobProfileDto) {
        const queryRunner =
            this.jobsRepository.manager.connection.createQueryRunner();

        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const job = await queryRunner.manager.findOne(Jobs, {
                where: { id: jobId },
            });

            if (!job) {
                throw new NotFoundException('Job not found');
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
                        user_id: 1,
                        hide: 0,
                    })),
                );
            }

            // KNOWLEDGE
            if (dto.knowledge_ids?.length) {
                await queryRunner.manager.save(
                    JobKnowledge,
                    dto.knowledge_ids.map((knowledge_id) => ({
                        job_id: jobId,
                        knowledge_id,
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