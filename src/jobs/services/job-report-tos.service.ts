import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JobReportTos } from '../entities/job-report-tos.entity';
import { CreateJobReportTosDto } from '../dtos/create-job-report-tos.dto';
import { UpdateJobReportTosDto } from '../dtos/update-job-report-tos.dto';
import { NotFoundException } from '@nestjs/common';

@Injectable()
export class JobReportTosService {
    constructor(
        @InjectRepository(JobReportTos)
        private repo: Repository<JobReportTos>,
    ) { }

    // CREATE
    async create(dto: CreateJobReportTosDto) {
        const entity = this.repo.create({
            ...dto,
            created_at: new Date(),
            updated_at: new Date(),
        });

        const saved = await this.repo.save(entity);

        return {
            success: true,
            message: 'Job report created successfully',
            data: saved,
        };
    }

    // FIND ALL
    async findAll() {
        return this.repo
            .createQueryBuilder('report')
            .leftJoin('report.job', 'job')
            .select([
                'report.id',
                'report.job_id',
                'report.supervises',
                'report.interacts_with',
                'report.report_to',
                'report.created_at',
                'report.updated_at',

                'job.id',
                'job.title',
            ])
            .orderBy('report.id', 'DESC')
            .getMany();
    }

    // FIND ONE
    async findOne(id: number) {
        const data = await this.repo
            .createQueryBuilder('report')
            .leftJoin('report.job', 'job')
            .select([
                'report',
                'job.id',
                'job.title',
            ])
            .where('report.id = :id', { id })
            .getOne();

        if (!data) {
            throw new NotFoundException('Job report not found');
        }

        return data;
    }

    // UPDATE (IMPORTANT PART)
    async update(id: number, dto: UpdateJobReportTosDto) {
        const updateData: any = {
            ...dto,
            updated_at: new Date(),
        };

        if (dto.job_id) {
            updateData.job = { id: dto.job_id };
            delete updateData.job_id;
        }

        await this.repo
            .createQueryBuilder()
            .update()
            .set(updateData)
            .where('id = :id', { id })
            .execute();

        return {
            success: true,
            message: 'Job report updated successfully',
        };
    }

    // DELETE
    async remove(id: number) {
        await this.repo
            .createQueryBuilder()
            .delete()
            .where('id = :id', { id })
            .execute();

        return {
            success: true,
            message: 'Job report deleted successfully',
        };
    }
}
