import {
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';

import { ExperienceTypes } from
    'src/entities/experience-types.entity';

import { CreateExperienceTypeDto } from
    './dto/create-experience-type.dto';

import { UpdateExperienceTypeDto } from
    './dto/update-experience-type.dto';

@Injectable()
export class ExperienceTypesService {
    constructor(
        @InjectRepository(ExperienceTypes)
        private readonly experienceTypesRepo: Repository<ExperienceTypes>,
    ) { }

    // CREATE
    async create(dto: CreateExperienceTypeDto) {
        const experienceType = this.experienceTypesRepo.create({
            name: dto.name.trim(),
        });

        const saved = await this.experienceTypesRepo.save(experienceType);

        return {
            success: true,
            message: 'Experience type created successfully',
            data: saved,
        };
    }

    // READ ALL: pagination + search
    async findAll(search = '') {
        const query = this.experienceTypesRepo
            .createQueryBuilder('experienceType');

        if (search.trim()) {
            query.where('experienceType.name LIKE :search', {
                search: `%${search.trim()}%`,
            });
        }

        const data = await query
            .orderBy('experienceType.id', 'DESC')
            .getMany();

        return {
            success: true,
            message: 'Experience types retrieved successfully',
            data
         
        };
    }

    // READ ONE
    async findOne(id: number) {
        const experienceType = await this.experienceTypesRepo.findOne({
            where: { id },
        });

        if (!experienceType) {
            throw new NotFoundException(
                `Experience type with ID ${id} was not found`,
            );
        }

        return {
            success: true,
            message: 'Experience type retrieved successfully',
            data: experienceType,
        };
    }

    // UPDATE
    async update(
        id: number,
        dto: UpdateExperienceTypeDto,
    ) {
        const experienceType = await this.experienceTypesRepo.findOne({
            where: { id },
        });

        if (!experienceType) {
            throw new NotFoundException(
                `Experience type with ID ${id} was not found`,
            );
        }

        if (dto.name !== undefined) {
            experienceType.name = dto.name.trim();
        }

        const updated = await this.experienceTypesRepo.save(experienceType);

        return {
            success: true,
            message: 'Experience type updated successfully',
            data: updated,
        };
    }

    // DELETE
    async remove(id: number) {
        const experienceType = await this.experienceTypesRepo.findOne({
            where: { id },
        });

        if (!experienceType) {
            throw new NotFoundException(
                `Experience type with ID ${id} was not found`,
            );
        }

        await this.experienceTypesRepo.remove(experienceType);

        return {
            success: true,
            message: 'Experience type deleted successfully',
        };
    }
}