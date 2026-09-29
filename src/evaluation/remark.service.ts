 import {
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Remark } from '../entities/remark.entity';
import { CreateRemarkDto } from './dto/create-remark.dto';
import { UpdateRemarkDto } from './dto/update-remark.dto';

@Injectable()
export class RemarkService {
    constructor(
        @InjectRepository(Remark)
        private readonly remarkRepository: Repository<Remark>,
    ) {}

    // GET ALL
    async index(
        page: number = 1,
        limit: number = 20,
        search: string = '',
    ) {
        const skip = (page - 1) * limit;

        const query = this.remarkRepository
            .createQueryBuilder('remark')
            .where('remark.hide = :hide', { hide: 0 });

        if (search.trim()) {
            query.andWhere(
                '(remark.remark LIKE :search OR CAST(remark.score AS CHAR) LIKE :search)',
                {
                    search: `%${search.trim()}%`,
                },
            );
        }

        query
            .orderBy('remark.id', 'DESC')
            .skip(skip)
            .take(limit);

        const [data, total] = await query.getManyAndCount();

        return {
            status: true,
            message: 'Remarks retrieved successfully',
            data,
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        };
    }

    // GET ONE
    async show(id: number) {
        const remark = await this.remarkRepository.findOne({
            where: { id },
        });

        if (!remark) {
            throw new NotFoundException('Remark not found');
        }

        return {
            status: true,
            message: 'Remark retrieved successfully',
            data: remark,
        };
    }

    // CREATE
    async store(
        userId: number,
        dto: CreateRemarkDto,
    ) {
        const remark = this.remarkRepository.create({
            score: dto.score,
            remark: dto.remark,
            hide: dto.hide ?? 0,
            creator_id: userId,
            updator_id: userId,
        });

        const saved = await this.remarkRepository.save(remark);

        return {
            status: true,
            message: 'Remark created successfully',
            data: saved,
        };
    }

    // UPDATE
    async update(
        id: number,
        userId: number,
        dto: UpdateRemarkDto,
    ) {
        const remark = await this.remarkRepository.findOne({
            where: { id },
        });

        if (!remark) {
            throw new NotFoundException('Remark not found');
        }

        Object.assign(remark, dto);

        remark.updator_id = userId;

        const updated = await this.remarkRepository.save(remark);

        return {
            status: true,
            message: 'Remark updated successfully',
            data: updated,
        };
    }

    // DELETE
    async destroy(id: number) {
        const remark = await this.remarkRepository.findOne({
            where: { id },
        });

        if (!remark) {
            throw new NotFoundException('Remark not found');
        }

        await this.remarkRepository.remove(remark);

        return {
            status: true,
            message: 'Remark deleted successfully',
        };
    }
}