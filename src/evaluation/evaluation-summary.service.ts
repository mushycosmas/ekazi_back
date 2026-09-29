 import {
    Injectable,
    NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { EvaluationSummary } from '../entities/evaluation-summary.entity';

 import { CreateEvaluationSummaryDto } from './dto/create-evaluation-summary.dto';
 import { UpdateEvaluationSummaryDto } from './dto/update-evaluation-summary.dto';

@Injectable()
export class EvaluationSummaryService {

    constructor(
        @InjectRepository(EvaluationSummary)
        private readonly evaluationSummaryRepository:
            Repository<EvaluationSummary>,
    ) {}

    /**
     * INDEX
     */
    async index(
        page: number = 1,
        limit: number = 20,
        search: string = '',
    ) {
        const skip = (page - 1) * limit;

        const query = this.evaluationSummaryRepository
            .createQueryBuilder('summary');

        if (search.trim()) {
            query.where(
                'summary.summary LIKE :search',
                {
                    search: `%${search.trim()}%`,
                },
            );
        }

        query
            .orderBy('summary.id', 'DESC')
            .skip(skip)
            .take(limit);

        const [data, total] =
            await query.getManyAndCount();

        return {
            status: true,
            message: 'Evaluation summaries retrieved successfully',
            data,
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        };
    }

    /**
     * SHOW
     */
    async show(id: number) {
        const summary =
            await this.evaluationSummaryRepository.findOne({
                where: {
                    id,
                },
            });

        if (!summary) {
            throw new NotFoundException(
                'Evaluation summary not found',
            );
        }

        return {
            status: true,
            message: 'Evaluation summary retrieved successfully',
            data: summary,
        };
    }

    /**
     * CREATE
     */
    async store(
        userId: number,
        dto: CreateEvaluationSummaryDto,
    ) {
        const summary =
            this.evaluationSummaryRepository.create({
                summary: dto.summary,
                creator_id: userId,
                updator_id: userId,
            });

        const saved =
            await this.evaluationSummaryRepository.save(summary);

        return {
            status: true,
            message: 'Evaluation summary created successfully',
            data: saved,
        };
    }

    /**
     * UPDATE
     */
    async update(
        id: number,
        userId: number,
        dto: UpdateEvaluationSummaryDto,
    ) {
        const summary =
            await this.evaluationSummaryRepository.findOne({
                where: {
                    id,
                },
            });

        if (!summary) {
            throw new NotFoundException(
                'Evaluation summary not found',
            );
        }

        Object.assign(summary, dto);

        summary.updator_id = userId;

        const updated =
            await this.evaluationSummaryRepository.save(summary);

        return {
            status: true,
            message: 'Evaluation summary updated successfully',
            data: updated,
        };
    }

    /**
     * DELETE
     */
    async destroy(
        id: number,
    ) {
        const summary =
            await this.evaluationSummaryRepository.findOne({
                where: {
                    id,
                },
            });

        if (!summary) {
            throw new NotFoundException(
                'Evaluation summary not found',
            );
        }

        await this.evaluationSummaryRepository.remove(summary);

        return {
            status: true,
            message: 'Evaluation summary deleted successfully',
        };
    }
}