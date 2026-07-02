import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MetaKeywords } from 'src/entities/meta-keywords.entity';
import { Repository } from 'typeorm';
import { CreateMetaKeywordDto } from './dto/create-meta-keyword.dto';
import { UpdateMetaKeywordDto } from './dto/update-meta-keyword.dto';
import { NotFoundException } from '@nestjs/common';

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

    async findAll() {
        const data = await this.repository.find({
            order: {
                id: 'DESC',
            },
        });

        const formatted = data.map(({ created_at, updated_at, ...rest }) => rest);

        return {
            success: true,
            message: 'Meta keywords retrieved successfully',
            data: formatted,
        };
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
