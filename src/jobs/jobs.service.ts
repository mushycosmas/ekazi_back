import {
    Injectable,
    NotFoundException,
    InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

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

import { CompleteJobProfileDto } from './dtos/complete-job-profile.dto';

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
    ) {}

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

        const job = this.jobsRepository.create({
            ...createJobDto,
            created_at: new Date(),
            updated_at: new Date(),
        });

        const saved = await this.jobsRepository.save(job);

        return {
            success: true,
            message: 'Job created successfully',
            data: saved,
        };
    }

    // =========================
    // FIND ALL
    // =========================
    async findAll(limit = 20, cursor?: number, search?: string) {
        const query = this.jobsRepository
            .createQueryBuilder('job')
            .leftJoin('job.client', 'client')
            .select(['job.id', 'job.title', 'job.status'])
            .orderBy('job.id', 'DESC')
            .take(limit);

        if (cursor) {
            query.where('job.id < :cursor', { cursor });
        }

        if (search) {
            query.andWhere('job.title LIKE :search', {
                search: `%${search}%`,
            });
        }

        const jobs = await query.getMany();

        return {
            success: true,
            data: jobs,
        };
    }

    // =========================
    // FIND ONE
    // =========================
    async findOne(id: number) {
        const job = await this.jobsRepository.findOne({
            where: { id },
        });

        if (!job) {
            throw new NotFoundException('Job not found');
        }

        return job;
    }

    // =========================
    // UPDATE JOB
    // =========================
    async update(id: number, dto: UpdateJobDto) {
        await this.findOne(id);
        await this.jobsRepository.update(id, {
            ...dto,
            updated_at: new Date(),
        });

        return this.findOne(id);
    }

    // =========================
    // DELETE JOB
    // =========================
    async remove(id: number) {
        const job = await this.findOne(id);
        await this.jobsRepository.remove(job);

        return {
            success: true,
            message: 'Job deleted successfully',
        };
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
            message: 'Job profile deleted successfully',
        };
    }
}