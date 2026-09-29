import {
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Benefit } from '../entities/benefit.entity';

import { CreateBenefitDto } from './dto/create-benefit.dto';
import { UpdateBenefitDto } from './dto/update-benefit.dto';

@Injectable()
export class BenefitService {
    constructor(
        @InjectRepository(Benefit)
        private readonly benefitRepository: Repository<Benefit>,
    ) {}

    /**
     * GET ALL BENEFITS
     */
    async index(
        page: number = 1,
        limit: number = 20,
        search: string = '',
    ) {
        const skip = (page - 1) * limit;

        const query = this.benefitRepository
            .createQueryBuilder('benefit');

        if (search.trim()) {
            query.where(
                'benefit.name LIKE :search',
                {
                    search: `%${search.trim()}%`,
                },
            );
        }

        query
            .orderBy('benefit.id', 'DESC')
            .skip(skip)
            .take(limit);

        const [data, total] =
            await query.getManyAndCount();

        return {
            status: true,
            message: 'Benefits retrieved successfully',
            data,
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        };
    }

    /**
     * GET ONE
     */
    async show(id: number) {
        const benefit =
            await this.benefitRepository.findOne({
                where: { id },
            });

        if (!benefit) {
            throw new NotFoundException(
                'Benefit not found',
            );
        }

        return {
            status: true,
            message: 'Benefit retrieved successfully',
            data: benefit,
        };
    }

    /**
     * CREATE
     */
    async store(
        userId: number,
        dto: CreateBenefitDto,
    ) {
        const existing =
            await this.benefitRepository.findOne({
                where: {
                    name: dto.name,
                },
            });

        if (existing) {
            throw new ConflictException(
                'Benefit already exists',
            );
        }

        const benefit =
            this.benefitRepository.create({
                name: dto.name,
                creator_id: userId,
                updator_id: userId,
            });

        const saved =
            await this.benefitRepository.save(
                benefit,
            );

        return {
            status: true,
            message: 'Benefit created successfully',
            data: saved,
        };
    }

    /**
     * UPDATE
     */
    async update(
        id: number,
        userId: number,
        dto: UpdateBenefitDto,
    ) {
        const benefit =
            await this.benefitRepository.findOne({
                where: { id },
            });

        if (!benefit) {
            throw new NotFoundException(
                'Benefit not found',
            );
        }

        if (dto.name) {
            const existing =
                await this.benefitRepository.findOne({
                    where: {
                        name: dto.name,
                    },
                });

            if (
                existing &&
                existing.id !== id
            ) {
                throw new ConflictException(
                    'Benefit already exists',
                );
            }
        }

        Object.assign(benefit, dto);

        benefit.updator_id = userId;

        const updated =
            await this.benefitRepository.save(
                benefit,
            );

        return {
            status: true,
            message: 'Benefit updated successfully',
            data: updated,
        };
    }

    /**
     * DELETE
     */
    async destroy(id: number) {
        const benefit =
            await this.benefitRepository.findOne({
                where: { id },
            });

        if (!benefit) {
            throw new NotFoundException(
                'Benefit not found',
            );
        }

        await this.benefitRepository.remove(
            benefit,
        );

        return {
            status: true,
            message: 'Benefit deleted successfully',
        };
    }
}