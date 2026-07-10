 import {
    Injectable,
    NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';

import { JobUniversalTypes } from '../entities/job-universal-types.entity';
import { Users } from 'src/entities/users.entity';

import { CreateJobUniversalTypeDto } from './dto/create-job-universal-type.dto';
import { UpdateJobUniversalTypeDto } from './dto/update-job-universal-type.dto';

@Injectable()
export class JobUniversalTypesService {

    constructor(
        @InjectRepository(JobUniversalTypes)
        private readonly repository: Repository<JobUniversalTypes>,
    ) {}

    async create(
        dto: CreateJobUniversalTypeDto,
        user: Users,
    ) {

        const entity = this.repository.create({

            ...dto,

            creator_id: user.id,

            updator_id: user.id,

        });

        await this.repository.save(entity);

        return {
            success: true,
            message: 'Job universal type created successfully.',
            data: entity,
        };
    }

   async findAll(
    page = 1,
    limit = 20,
    search?: string,
) {

    const where = search
        ? {
            type_name: Like(`%${search}%`),
        }
        : {};


    const [rows, total] =
        await this.repository.findAndCount({

            where,

            order: {
                type_name: 'ASC',
            },

            skip: (page - 1) * limit,

            take: limit,
        });


    const data = rows.map(item => ({
        id: item.id,
        type_name: item.type_name,
    }));


    return {
        success: true,
        message: "successful retrieve job types",
        data,

        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        },
    };
}

    async findOne(id: number) {

        const item = await this.repository.findOne({
            where: { id },
        });

        if (!item) {
            throw new NotFoundException(
                'Job universal type not found',
            );
        }

        return {
            success: true,
            message: "successful retrieve job types",
            data: item,
        };
    }

    async update(
        id: number,
        dto: UpdateJobUniversalTypeDto,
        user: Users,
    ) {

        const item = await this.repository.findOne({
            where: { id },
        });

        if (!item) {
            throw new NotFoundException(
                'Job universal type not found',
            );
        }

        Object.assign(item, dto);

        item.updator_id = user.id;

        await this.repository.save(item);

        return {
            success: true,
            message: 'Updated successfully.',
            data: item,
        };
    }

    async remove(id: number) {

        const item = await this.repository.findOne({
            where: { id },
        });

        if (!item) {
            throw new NotFoundException(
                'Job universal type not found',
            );
        }

        await this.repository.remove(item);

        return {
            success: true,
            message: 'Deleted successfully.',
        };
    }
}