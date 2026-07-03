import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreatePositionLevelDto } from './dto/create-position-level.dto';
import { Repository } from 'typeorm';
import { UpdatePositionLevelDto } from './dto/update-position-level.dto';
import { PositionLevels } from 'src/entities/position-levels.entity';

@Injectable()
export class PositionLevelsService {
    constructor(
        @InjectRepository(PositionLevels)
        private readonly repo: Repository<PositionLevels>,
    ) { }

    // CREATE
    async create(dto: CreatePositionLevelDto) {
        const data = this.repo.create(dto);
        return this.repo.save(data);
    }

    // FIND ALL
    async findAll() {
        const data = await this.repo.find({
            order: { id: 'DESC' },
        });

        const formatted = data.map(({ id, position_name }) => ({
            id,
            name: position_name,
        }));

        return {
            success: true,
            message: 'Position levels retrieved successfully',
            data: formatted,
        };
    }

    // FIND ONE
    async findOne(id: number) {
        const data = await this.repo.findOne({ where: { id } });

        if (!data) {
            throw new NotFoundException('Position level not found');
        }

        return {
            success: true,
            message: 'Position level retrieved successfully',
            data,
        };
    }

    // UPDATE
    async update(id: number, dto: UpdatePositionLevelDto) {
        const data = await this.repo.findOne({ where: { id } });

        if (!data) {
            throw new NotFoundException('Position level not found');
        }

        Object.assign(data, dto);
        return this.repo.save(data);
    }

    // DELETE (soft delete style)
    async remove(id: number) {
        const data = await this.repo.findOne({ where: { id } });

        if (!data) {
            throw new NotFoundException('Position level not found');
        }

        return this.repo.remove(data);
    }
}
