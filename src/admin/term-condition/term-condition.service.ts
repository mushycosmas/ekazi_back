import {
    Injectable,
    NotFoundException,
} from '@nestjs/common';

import {
    IsNull,
    Repository,
} from 'typeorm';

import { InjectRepository } from '@nestjs/typeorm';


import { TermCondition } from 'src/entities/term-condition.entity';

@Injectable()
export class TermConditionService {
    constructor(
        @InjectRepository(TermCondition)
        private readonly termConditionRepository: Repository<TermCondition>,
    ) {}

    async create(data: Partial<TermCondition>) {
        const termCondition =
            this.termConditionRepository.create(data);

        return await this.termConditionRepository.save(
            termCondition,
        );
    }

    /**
     * Get all active term conditions
     */
    async findAll() {
        return await this.termConditionRepository.find({
            where: {
                deleted_at: IsNull(),
            },
            relations: {
                type: true,
            },
            order: {
                id: 'DESC',
            },
        });
    }

    /**
     * Get one active term condition
     */
    async findOne(id: number) {
        const termCondition =
            await this.termConditionRepository.findOne({
                where: {
                    id,
                    deleted_at: IsNull(),
                },
                relations: {
                    type: true,
                },
            });

        if (!termCondition) {
            throw new NotFoundException(
                `Term condition with ID ${id} not found`,
            );
        }

        return termCondition;
    }

    /**
     * Update
     */
    async update(
        id: number,
        data: Partial<TermCondition>,
    ) {
        const termCondition = await this.findOne(id);

        Object.assign(termCondition, data);

        return await this.termConditionRepository.save(
            termCondition,
        );
    }

    /**
     * Soft delete
     */
    async remove(id: number) {
        const termCondition = await this.findOne(id);

        termCondition.deleted_at = new Date();

        await this.termConditionRepository.save(
            termCondition,
        );

        return {
            success: true,
            message: 'Term condition deleted successfully',
        };
    }

    /**
     * Restore
     */
    async restore(id: number) {
        const termCondition =
            await this.termConditionRepository.findOne({
                where: {
                    id,
                },
                relations: {
                    type: true,
                },
            });

        if (!termCondition) {
            throw new NotFoundException(
                `Term condition with ID ${id} not found`,
            );
        }

        termCondition.deleted_at = null;

        return await this.termConditionRepository.save(
            termCondition,
        );
    }
}