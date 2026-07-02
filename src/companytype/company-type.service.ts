import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ClientType } from 'src/client/entities/client-types.entity';
import { CreateClientTypeDto } from './dto/create-client-type.dto';
import { UpdateClientTypeDto } from './dto/update-client-type.dto';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';

@Injectable()
export class CompanyTypeService {
     constructor(
        @InjectRepository(ClientType)
        private readonly repo: Repository<ClientType>,
    ) {}

    // ======================
    // CREATE
    // ======================
    async create(dto: CreateClientTypeDto) {
        const type = this.repo.create(dto);
        const saved = await this.repo.save(type);

        return {
            success: true,
            message: 'Client type created successfully',
            data: saved,
        };
    }

    // ======================
    // GET ALL
    // ======================
    async findAll() {
        const data = await this.repo.find({
            order: {
                id: 'DESC',
            },
        });

        return {
            success: true,
            message: 'Client types retrieved successfully',
            data,
        };
    }

    // ======================
    // GET ONE
    // ======================
    async findOne(id: number) {
        const type = await this.repo.findOne({
            where: { id },
        });

        if (!type) {
            throw new NotFoundException('Client type not found');
        }

        return {
            success: true,
            message: 'Client type retrieved successfully',
            data: type,
        };
    }

    // ======================
    // UPDATE
    // ======================
    async update(id: number, dto: UpdateClientTypeDto) {
        const type = await this.repo.findOne({
            where: { id },
        });

        if (!type) {
            throw new NotFoundException('Client type not found');
        }

        Object.assign(type, dto);

        const updated = await this.repo.save(type);

        return {
            success: true,
            message: 'Client type updated successfully',
            data: updated,
        };
    }

    // ======================
    // DELETE
    // ======================
    async remove(id: number) {
        const type = await this.repo.findOne({
            where: { id },
        });

        if (!type) {
            throw new NotFoundException('Client type not found');
        }

        await this.repo.remove(type);

        return {
            success: true,
            message: 'Client type deleted successfully',
        };
    }
}
