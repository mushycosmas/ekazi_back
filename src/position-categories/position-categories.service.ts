 import {
    Injectable,
    NotFoundException,
    ConflictException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, Not } from 'typeorm';

import { PositionCategories } from 'src/entities/position-categories.entity';
import { CreatePositionCategoryDto } from './dto/create-position-category.dto';
import { UpdatePositionCategoryDto } from './dto/update-position-category.dto';

@Injectable()
export class PositionCategoriesService {
    constructor(
        @InjectRepository(PositionCategories)
        private readonly categoriesRepo: Repository<PositionCategories>,
    ) {}

    // CREATE
    async create(dto: CreatePositionCategoryDto) {
        const name = dto.name.trim();

        const existing = await this.categoriesRepo.findOne({
            where: { name },
        });

        if (existing) {
            throw new ConflictException('job category already exists.');
        }

        const category = this.categoriesRepo.create({
            name,
            description: dto.description?.trim() || null,
        });

        const saved = await this.categoriesRepo.save(category);

        return {
            success: true,
            message: 'job category created successfully',
            data: saved,
        };
    }

    // GET ALL
    async findAll(page = 1, limit = 20, search = '') {
        page = Math.max(1, Number(page) || 1);
        limit = Math.min(100, Math.max(1, Number(limit) || 20));

        const query = this.categoriesRepo
            .createQueryBuilder('category')
            .where('category.hide = :hide', { hide: 0 });

        if (search.trim()) {
            query.andWhere(
                '(category.name LIKE :search OR category.description LIKE :search)',
                { search: `%${search.trim()}%` },
            );
        }

        query.orderBy('category.id', 'DESC');

        const [categories, total] = await query
            .skip((page - 1) * limit)
            .take(limit)
            .getManyAndCount();

        return {
            success: true,
            message: 'job categories retrieved successfully',
            data: categories,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }

    // GET ONE
    async findOne(id: number) {
        const category = await this.categoriesRepo.findOne({
            where: { id, hide: 0 },
            relations: ['positions'],
        });

        if (!category) {
            throw new NotFoundException('Position category not found.');
        }

        return {
            success: true,
            data: category,
        };
    }

    // UPDATE
    async update(id: number, dto: UpdatePositionCategoryDto) {
        const category = await this.categoriesRepo.findOne({
            where: { id, hide: 0 },
        });

        if (!category) {
            throw new NotFoundException('job category not found.');
        }

        if (dto.name !== undefined) {
            const name = dto.name.trim();

            const existing = await this.categoriesRepo.findOne({
                where: {
                    name,
                    id: Not(id),
                },
            });

            if (existing) {
                throw new ConflictException('Job category name already exists.');
            }

            category.name = name;
        }

        if (dto.description !== undefined) {
            category.description = dto.description?.trim() || null;
        }

        const updated = await this.categoriesRepo.save(category);

        return {
            success: true,
            message: 'Job category updated successfully',
            data: updated,
        };
    }

 async remove(id: number) {
    const category = await this.categoriesRepo.findOne({
        where: { id },
    });

    if (!category) {
        throw new NotFoundException('Job category not found.');
    }

    await this.categoriesRepo.remove(category);

    return {
        success: true,
        message: 'Job category permanently deleted successfully',
    };
}
}