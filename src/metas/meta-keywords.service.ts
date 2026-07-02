import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MetaKeywords } from 'src/entities/meta-keywords.entity';
import { Repository } from 'typeorm';
import { CreateMetaKeywordDto } from './dto/create-meta-keyword.dto';
import { UpdateMetaKeywordDto } from './dto/update-meta-keyword.dto';
import { NotFoundException } from '@nestjs/common';
import { InternalServerErrorException } from '@nestjs/common';

@Injectable()
export class MetaKeywordsService {
    constructor(
        @InjectRepository(MetaKeywords)
        private readonly repository: Repository<MetaKeywords>,
    ) { }

    async create(dto: CreateMetaKeywordDto) {
        const keyword = this.repository.create({
            ...dto,
            created_at: new Date(),
            updated_at: new Date(),
        });

        const data = await this.repository.save(keyword);

        return {
            success: true,
            message: 'Meta keyword created successfully',
            data,
        };
    }

    async findAll(page = 1, limit = 20, search?: string) {
        try {
            const query = this.repository
                .createQueryBuilder('meta')
                .select([
                    'meta.id',
                    'meta.entity_type',
                    'meta.name',
                    'meta.creator_id',
                    'meta.updator_id',
                    'meta.created_at',
                    'meta.updated_at',
                ])
                .orderBy('meta.id', 'DESC');

            // ======================
            // SEARCH FILTER
            // ======================
            if (search && search.trim()) {
                query.where('meta.name LIKE :search', {
                    search: `%${search}%`,
                });
            }

            // ======================
            // TOTAL COUNT
            // ======================
            const totalQuery = this.repository.createQueryBuilder('meta');

            if (search && search.trim()) {
                totalQuery.where('meta.name LIKE :search', {
                    search: `%${search}%`,
                });
            }

            const totalResult = await totalQuery
                .select('COUNT(*)', 'count')
                .getRawOne();

            const total = Number(totalResult.count);

            // ======================
            // PAGINATION
            // ======================
            const data = await query
                .skip((page - 1) * limit)
                .take(limit)
                .getMany();

            // ======================
            // REMOVE created_at/updated_at
            // ======================
            const formatted = data.map(({ created_at, updated_at, ...rest }) => rest);

            return {
                success: true,
                message: 'Meta keywords retrieved successfully',
                data: formatted,
                current_page: page,
                per_page: limit,
                total,
                total_pages: Math.ceil(total / limit),
            };
        } catch (error) {
            throw new InternalServerErrorException({
                success: false,
                message: 'Failed to fetch meta keywords',
                error: error.message,
            });
        }
    }

    async findOne(id: number) {
        const keyword = await this.repository.findOne({
            where: { id },
        });

        if (!keyword) {
            throw new NotFoundException('Meta keyword not found');
        }

        const { created_at, updated_at, ...clean } = keyword;

        return {
            success: true,
            message: 'Meta keyword retrieved successfully',
            data: clean,
        };
    }

    async update(
        id: number,
        dto: UpdateMetaKeywordDto,
    ) {
        const keyword = await this.repository.findOne({
            where: { id },
        });

        if (!keyword) {
            throw new NotFoundException(
                'Meta keyword not found',
            );
        }


        Object.assign(keyword, dto);

        keyword.updated_at = new Date();

        const data = await this.repository.save(keyword);


        return {
            success: true,
            message: 'Meta keyword updated successfully',
            data,
        };
    }

    async remove(id: number) {
        const keyword = await this.repository.findOne({
            where: { id },
        });

        if (!keyword) {
            throw new NotFoundException(
                'Meta keyword not found',
            );
        }

        await this.repository.remove(keyword);

        return {
            success: true,
            message: 'Meta keyword deleted successfully',
        };
    }
}
