
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InternalServerErrorException } from '@nestjs/common';

import { Jobs } from './entities/job.entity';
import { CreateJobDto } from './dtos/create-job.dto';
import { UpdateJobDto } from './dtos/update-job.dto';


@Injectable()
export class JobsService {
    constructor(
        @InjectRepository(Jobs)
        private readonly jobsRepository: Repository<Jobs>,
    ) { }

    async create(createJobDto: CreateJobDto) {
        const job = this.jobsRepository.create(createJobDto);

        return await this.jobsRepository.save(job);
    }

    async findAll(
        page = 1,
        limit = 20,
        search?: string,
    ) {
        try {
            const query = this.jobsRepository
                .createQueryBuilder('job')

                // Main Relations
                .leftJoinAndSelect('job.client', 'client')
                .leftJoinAndSelect('job.country', 'country')
                .leftJoinAndSelect('job.region', 'region')
                .leftJoinAndSelect('job.industry', 'industry')
                .leftJoinAndSelect('job.position', 'position')
                .leftJoinAndSelect('job.positionLevel', 'positionLevel')
                .leftJoinAndSelect('job.gender', 'gender')
                .leftJoinAndSelect('job.currency', 'currency')

                // Job Details
                .leftJoinAndSelect('job.addresses', 'addresses')
                .leftJoinAndSelect('job.jobEducation', 'education')
                .leftJoinAndSelect('job.languages', 'languages')
                .leftJoinAndSelect('job.jobSalaries', 'salaries')
                .leftJoinAndSelect('job.jobRequirements', 'requirements')

                .orderBy('job.id', 'DESC');

            if (search) {
                query.where(
                    'job.job_title LIKE :search',
                    { search: `%${search}%` },
                );
            }

            const totalQuery = this.jobsRepository
                .createQueryBuilder('job');

            if (search) {
                totalQuery.where(
                    'job.job_title LIKE :search',
                    { search: `%${search}%` },
                );
            }

            const totalResult = await totalQuery
                .select('COUNT(*)', 'count')
                .getRawOne();

            const total = Number(totalResult.count);

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

    async findOne(id: number) {
        const job = await this.jobsRepository.findOne({
            where: { id },
        });

        if (!job) {
            throw new NotFoundException('Job not found');
        }

        return job;
    }

    async update(id: number, updateJobDto: UpdateJobDto) {
        await this.findOne(id);

        await this.jobsRepository.update(id, updateJobDto);

        return this.findOne(id);
    }

    async remove(id: number) {
        const job = await this.findOne(id);

        await this.jobsRepository.remove(job);

        return {
            message: 'Job deleted successfully',
        };
    }
}
