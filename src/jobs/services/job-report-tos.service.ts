import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { JobReportTos } from '../entities/job-report-tos.entity';
import { CreateJobReportTosDto } from '../dtos/create-job-report-tos.dto';
import { UpdateJobReportTosDto } from '../dtos/update-job-report-tos.dto';

import { Users } from 'src/entities/users.entity';

@Injectable()
export class JobReportTosService {
    constructor(
        @InjectRepository(JobReportTos)
        private readonly repo: Repository<JobReportTos>,
    ) { }

    // CREATE
    async create(
        user: Users,
        dto: CreateJobReportTosDto,
    ) {
        if (!user) {
            throw new BadRequestException(
                'User is not linked to a client',
            );
        }

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
    async findAll(user: Users) {
        if (!user.client_id) {
            throw new BadRequestException(
                'User is not linked to a client',
            );
        }

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
            .where('job.client_id = :clientId', {
                clientId: user.client_id,
            })
            .orderBy('report.id', 'DESC')
            .getMany();
    }

    // FIND ONE
    async findOne(
        user: Users,
        id: number,
    ) {
        if (!user.client_id) {
            throw new BadRequestException(
                'User is not linked to a client',
            );
        }

        const data = await this.repo
            .createQueryBuilder('report')
            .leftJoin('report.job', 'job')
            .select([
                'report',
                'job.id',
                'job.title',
            ])
            .where('report.id = :id', { id })
            .andWhere('job.client_id = :clientId', {
                clientId: user.client_id,
            })
            .getOne();

        if (!data) {
            throw new NotFoundException(
                'Job report not found',
            );
        }

        return data;
    }

    // UPDATE
    async update(
        user: Users,
        id: number,
        dto: UpdateJobReportTosDto,
    ) {
        const report = await this.findOne(user, id);

        if (dto.job_id) {
            report.job = {
                id: dto.job_id,
            } as any;
        }

        if (dto.supervises !== undefined) {
            report.supervises = dto.supervises;
        }

        if (dto.interacts_with !== undefined) {
            report.interacts_with = dto.interacts_with;
        }

        if (dto.report_to !== undefined) {
            report.report_to = dto.report_to;
        }

        report.updated_at = new Date();

        await this.repo.save(report);

        return {
            success: true,
            message: 'Job report updated successfully',
        };
    }

    // DELETE
    async remove(
        user: Users,
        id: number,
    ) {
        const report = await this.findOne(user, id);

        await this.repo.remove(report);

        return {
            success: true,
            message: 'Job report deleted successfully',
        };
    }
}