import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { EvaluationCriteria } from 'src/entities/evaluation-criteria.entity';
import { Evaluation } from 'src/entities/evaluation.entity';
import { CreateEvaluationCriteriaDto } from './dto/create-evaluation-criteria.dto';
import { UpdateEvaluationCriteriaDto } from './dto/update-evaluation-criteria.dto';

@Injectable()
export class EvaluationCriteriaService {

    constructor(
        @InjectRepository(EvaluationCriteria)
        private readonly criteriaRepository:
            Repository<EvaluationCriteria>,

        @InjectRepository(Evaluation)
        private readonly evaluationRepository:
            Repository<Evaluation>,
    ) { }


    /**
     * ============================================================
     * INDEX
     * GET /api/evaluation-criteria
     * ============================================================
     */
  async index(
    clientId: number,
    evaluationId?: number,
    page: number = 1,
    limit: number = 20,
    search: string = '',
) {
    const skip = (page - 1) * limit;

    const query = this.criteriaRepository
        .createQueryBuilder('criteria')
        .innerJoinAndSelect(
            'criteria.evaluation',
            'evaluation',
        )
        .where(
            'evaluation.client_id = :clientId',
            { clientId },
        );

    /**
     * Filter by evaluation
     */
    if (evaluationId) {
        query.andWhere(
            'criteria.evaluation_id = :evaluationId',
            { evaluationId },
        );
    }

    /**
     * Search criteria or evaluation name
     */
    if (search.trim()) {
        query.andWhere(
            `(
                criteria.name LIKE :search
                OR criteria.description LIKE :search
                OR evaluation.name LIKE :search
                OR evaluation.group LIKE :search
            )`,
            {
                search: `%${search.trim()}%`,
            },
        );
    }

    query
        .orderBy(
            'criteria.created_at',
            'DESC',
        )
        .skip(skip)
        .take(limit);

    const [criteria, total] =
        await query.getManyAndCount();

    /**
     * Format response
     */
    const data = criteria.map((item) => ({
        id: item.id,

        evaluation_id: item.evaluation_id,

        evaluation_name:
            item.evaluation?.name ?? null,
        name: item.name,
        hide: item.hide,

        creator_id: item.creator_id,

        updator_id: item.updator_id,

        created_at: item.created_at,

        updated_at: item.updated_at,
    }));

    return {
        status: true,
        message: 'Evaluation criteria retrieved successfully',

        data,

        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
    };
}


    /**
     * ============================================================
     * CREATE
     * POST /api/evaluation-criteria
     * ============================================================
     */
    async create(
        clientId: number,
        userId: number,
        dto: CreateEvaluationCriteriaDto,
    ) {

        /**
         * Make sure evaluation belongs to this client
         */
        const evaluation =
            await this.evaluationRepository.findOne({
                where: {
                    id: dto.evaluation_id,
                    client_id: clientId,
                },
            });

        if (!evaluation) {
            throw new NotFoundException(
                'Evaluation not found.',
            );
        }

        const criteria =
            this.criteriaRepository.create({
                evaluation_id: dto.evaluation_id,

                name: dto.name,

                hide: dto.hide ?? 0,

                creator_id: userId,

                updator_id: userId,
            });

        const saved =
            await this.criteriaRepository.save(criteria);

        return {
            status: true,
            message: 'Evaluation criteria created successfully',
            data: saved,
        };
    }


    /**
     * ============================================================
     * SHOW
     * GET /api/evaluation-criteria/:id
     * ============================================================
     */
    async show(
        clientId: number,
        id: number,
    ) {

        const criteria =
            await this.criteriaRepository
                .createQueryBuilder('criteria')
                .innerJoinAndSelect(
                    'criteria.evaluation',
                    'evaluation',
                )
                .where(
                    'criteria.id = :id',
                    { id },
                )
                .andWhere(
                    'evaluation.client_id = :clientId',
                    { clientId },
                )
                .getOne();

        if (!criteria) {
            throw new NotFoundException(
                'Evaluation criteria not found.',
            );
        }

        return {
            status: true,
            message: 'Evaluation criteria retrieved successfully',
            data: criteria,
        };
    }


    /**
     * ============================================================
     * UPDATE
     * PATCH /api/evaluation-criteria/:id
     * ============================================================
     */
    async update(
        clientId: number,
        userId: number,
        id: number,
        dto: UpdateEvaluationCriteriaDto,
    ) {

        const criteria =
            await this.criteriaRepository
                .createQueryBuilder('criteria')
                .innerJoin(
                    'criteria.evaluation',
                    'evaluation',
                )
                .where(
                    'criteria.id = :id',
                    { id },
                )
                .andWhere(
                    'evaluation.client_id = :clientId',
                    { clientId },
                )
                .getOne();

        if (!criteria) {
            throw new NotFoundException(
                'Evaluation criteria not found.',
            );
        }

        /**
         * If evaluation_id is being changed,
         * make sure the new evaluation belongs
         * to the same client.
         */
        if (
            dto.evaluation_id !== undefined &&
            dto.evaluation_id !== criteria.evaluation_id
        ) {

            const evaluation =
                await this.evaluationRepository.findOne({
                    where: {
                        id: dto.evaluation_id,
                        client_id: clientId,
                    },
                });

            if (!evaluation) {
                throw new BadRequestException(
                    'The selected evaluation does not belong to your client.',
                );
            }

            criteria.evaluation_id =
                dto.evaluation_id;
        }

        if (dto.name !== undefined) {
            criteria.name = dto.name;
        }

     

        if (dto.hide !== undefined) {
            criteria.hide = dto.hide;
        }

        criteria.updator_id = userId;

        const saved =
            await this.criteriaRepository.save(criteria);

        return {
            status: true,
            message: 'Evaluation criteria updated successfully',
            data: saved,
        };
    }


    /**
     * ============================================================
     * DELETE
     * DELETE /api/evaluation-criteria/:id
     * ============================================================
     */
    async destroy(
        clientId: number,
        id: number,
    ) {

        const criteria =
            await this.criteriaRepository
                .createQueryBuilder('criteria')
                .innerJoin(
                    'criteria.evaluation',
                    'evaluation',
                )
                .where(
                    'criteria.id = :id',
                    { id },
                )
                .andWhere(
                    'evaluation.client_id = :clientId',
                    { clientId },
                )
                .getOne();

        if (!criteria) {
            throw new NotFoundException(
                'Evaluation criteria not found.',
            );
        }

        await this.criteriaRepository.delete(id);

        return {
            status: true,
            message: 'Evaluation criteria deleted successfully',
        };
    }
}