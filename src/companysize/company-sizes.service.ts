import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CompanySize } from 'src/entities/company-size.entity';
import { CreateCompanySizeDto } from './dto/create-company-size.dto';
import { UpdateCompanySizeDto } from './dto/update-company-size.dto';

@Injectable()
export class CompanySizesService {
    constructor(
        @InjectRepository(CompanySize)
        private readonly repo: Repository<CompanySize>,
    ) {}

    // ======================
    // CREATE
    // ======================
    async create(dto: CreateCompanySizeDto) {
        const size = this.repo.create(dto);

        const data = await this.repo.save(size);

        return {
            success: true,
            message: 'Company size created successfully',
            data,
        };
    }

    // ======================
    // INTERNAL: GET ENTITY
    // ======================
    private async findEntity(id: number): Promise<CompanySize> {
        const size = await this.repo.findOne({
            where: { id },
        });

        if (!size) {
            throw new NotFoundException('Company size not found');
        }

        return size;
    }

    // ======================
    // GET ALL
    // ======================
    async findAll() {
        const data = await this.repo.find({
            order: { id: 'ASC' },
        });

        // remove timestamps from response
        const result = data.map(
            ({ created_at, updated_at, ...item }) => item,
        );

        return {
            success: true,
            message: 'Company sizes retrieved successfully',
            data: result,
        };
    }

    // ======================
    // GET ONE
    // ======================
    async findOne(id: number) {
        const size = await this.findEntity(id);

        const { created_at, updated_at, ...clean } = size;

        return {
            success: true,
            message: 'Company size retrieved successfully',
            data: clean,
        };
    }

    // ======================
    // UPDATE
    // ======================
    async update(id: number, dto: UpdateCompanySizeDto) {
        const size = await this.findEntity(id);

        Object.assign(size, dto);

        const updated = await this.repo.save(size);

        return {
            success: true,
            message: 'Company size updated successfully',
            data: updated,
        };
    }

    // ======================
    // DELETE
    // ======================
    async remove(id: number) {
        const size = await this.findEntity(id);

        await this.repo.remove(size);

        return {
            success: true,
            message: 'Company size deleted successfully',
        };
    }
}