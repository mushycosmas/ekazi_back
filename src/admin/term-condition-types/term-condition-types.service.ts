 import {
    Injectable,
    NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { TermConditionType } from 'src/entities/term-condition-type.entity';
import { CreateTermConditionTypeDto } from './dto/create-term-condition-type.dto';
import { UpdateTermConditionTypeDto } from './dto/update-term-condition-type.dto';

@Injectable()
export class TermConditionTypesService {
    constructor(
        @InjectRepository(TermConditionType)
        private readonly termConditionTypeRepository: Repository<TermConditionType>,
    ) {}

    /**
     * Create
     */
    async create(
        createDto: CreateTermConditionTypeDto,
    ): Promise<TermConditionType> {
        const termConditionType =
            this.termConditionTypeRepository.create({
                type: createDto.type,
                hide: createDto.hide ?? 0,
            });

        return await this.termConditionTypeRepository.save(
            termConditionType,
        );
    }

    /**
     * Get all active records
     */
    async findAll(): Promise<TermConditionType[]> {
        return await this.termConditionTypeRepository
            .createQueryBuilder('term_condition_type')
            .where('term_condition_type.deleted_at IS NULL')
            .orderBy('term_condition_type.id', 'DESC')
            .getMany();
    }

    /**
     * Get all records including hidden
     */
    async findAllIncludingHidden(): Promise<TermConditionType[]> {
        return await this.termConditionTypeRepository
            .createQueryBuilder('term_condition_type')
            .where('term_condition_type.deleted_at IS NULL')
            .orderBy('term_condition_type.id', 'DESC')
            .getMany();
    }

    /**
     * Get one
     */
    async findOne(id: number): Promise<TermConditionType> {
        const termConditionType =
            await this.termConditionTypeRepository
                .createQueryBuilder('term_condition_type')
                .where('term_condition_type.id = :id', { id })
                .andWhere(
                    'term_condition_type.deleted_at IS NULL',
                )
                .getOne();

        if (!termConditionType) {
            throw new NotFoundException(
                `Term condition type with ID ${id} not found`,
            );
        }

        return termConditionType;
    }

    /**
     * Update
     */
    async update(
        id: number,
        updateDto: UpdateTermConditionTypeDto,
    ): Promise<TermConditionType> {
        const termConditionType = await this.findOne(id);

        Object.assign(termConditionType, updateDto);

        return await this.termConditionTypeRepository.save(
            termConditionType,
        );
    }

    /**
     * Soft delete
     */
    async remove(id: number): Promise<{
        success: boolean;
        message: string;
    }> {
        const termConditionType = await this.findOne(id);

        termConditionType.deleted_at = new Date();

        await this.termConditionTypeRepository.save(
            termConditionType,
        );

        return {
            success: true,
            message: 'Term condition type deleted successfully',
        };
    }

    /**
     * Restore
     */
    async restore(id: number): Promise<TermConditionType> {
        const termConditionType =
            await this.termConditionTypeRepository
                .createQueryBuilder('term_condition_type')
                .where('term_condition_type.id = :id', { id })
                .getOne();

        if (!termConditionType) {
            throw new NotFoundException(
                `Term condition type with ID ${id} not found`,
            );
        }

        termConditionType.deleted_at = null;

        return await this.termConditionTypeRepository.save(
            termConditionType,
        );
    }

    /**
     * Hide / Unhide
     */
    async toggleHide(id: number): Promise<TermConditionType> {
        const termConditionType = await this.findOne(id);

        termConditionType.hide =
            termConditionType.hide === 1 ? 0 : 1;

        return await this.termConditionTypeRepository.save(
            termConditionType,
        );
    }
}