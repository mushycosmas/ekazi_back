import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JobMetas } from '../entities/job-metas.entity';
import { Repository } from 'typeorm';
import { CreateJobMetaDto } from '../dtos/create-job-meta.dto';
import { NotFoundException } from '@nestjs/common';
import { UpdateJobMetaDto } from '../dtos/update-job-meta.dto';

@Injectable()
export class JobMetaService {
    constructor(
        @InjectRepository(JobMetas)
        private readonly jobMetaRepository: Repository<JobMetas>,
    ) { }

    async create(createDto: CreateJobMetaDto) {
        const meta = this.jobMetaRepository.create({
            ...createDto,
            created_at: new Date(),
            updated_at: new Date(),
        });

        const savedMeta = await this.jobMetaRepository.save(meta);

        return {
            message: 'Job Meta created successfully',
            success: true,

        };
    }

    async findAll() {
        return await this.jobMetaRepository.find({
            relations: ['job', 'metaKeyword'],
        });
    }

    async findOne(id: number) {
        const meta = await this.jobMetaRepository.findOne({
            where: { id },
            relations: ['job', 'metaKeyword'],
        });

        if (!meta) {
            throw new NotFoundException(
                `Job Meta with ID ${id} not found`,
            );
        }

        return meta;
    }
    async update(id: number, updateDto: UpdateJobMetaDto) {
        const meta = await this.findOne(id);

        const {
            job_id,
            meta_keyword_id,
            ...rest
        } = updateDto;

        Object.assign(meta, rest);

        // IMPORTANT: update relations properly
        if (job_id) {
            meta.job = { id: job_id } as any;
        }

        if (meta_keyword_id) {
            meta.metaKeyword = { id: meta_keyword_id } as any;
        }

        meta.updated_at = new Date();

        await this.jobMetaRepository.save(meta);

        return {
            message: 'Job Meta updated successfully',
            success: true,
        };
    }
    async remove(id: number) {
        const meta = await this.findOne(id);

        await this.jobMetaRepository.remove(meta);

        return {
            success: true,
            message: 'Job Meta deleted successfully',
        };
    }
}
