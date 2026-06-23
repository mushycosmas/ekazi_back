import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JobEducation } from '../entities/job-education.entity';
import { Repository } from 'typeorm';
import { CreateJobEducationDto } from '../dtos/create-job-education.dto';
import { UpdateJobEducationDto } from '../dtos/update-job-education.dto';
import { NotFoundException } from '@nestjs/common';

@Injectable()
export class JobEducationService {
    constructor(
        @InjectRepository(JobEducation)
        private repo: Repository<JobEducation>,
    ) { }

    // CREATE
    async create(dto: CreateJobEducationDto) {
        const entity = this.repo.create({
            ...dto,
            created_at: new Date(),
        });

        const saved = await this.repo.save(entity);

        return {
            success: true,
            message: 'Job education created successfully',

        };
    }

    // FIND ALL
    async findAll() {
        return this.repo.find({
            relations: ['job', 'course', 'educationLevel', 'major'],
            order: { id: 'DESC' },
        });
    }

    // FIND ONE
    async findOne(id: number) {
        const data = await this.repo.findOne({
            where: { id },
            relations: ['course', 'educationLevel', 'major'],
        });

        if (!data) throw new NotFoundException('Job education not found');

        return data;
    }

    // UPDATE
    async update(id: number, dto: UpdateJobEducationDto) {
        const entity = await this.findOne(id);

        const {
            job_id,
            course_id,
            education_level_id,
            major_id,
            ...rest
        } = dto;

        Object.assign(entity, rest);

        // IMPORTANT: map relations properly
        if (job_id) {
            entity.job = { id: job_id } as any;
        }

        if (course_id) {
            entity.course = { id: course_id } as any;
        }

        if (education_level_id) {
            entity.educationLevel = { id: education_level_id } as any;
        }

        if (major_id) {
            entity.major = { id: major_id } as any;
        }

        entity.updated_at = new Date();

        await this.repo.save(entity);

        return {
            success: true,
            message: 'Job education updated successfully',
        };
    }

    // DELETE
    async remove(id: number) {
        const entity = await this.findOne(id);

        await this.repo.remove(entity);

        return {
            success: true,
            message: 'Job education deleted successfully',
        };
    }
}
