import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Users } from 'src/entities/users.entity';
import { InterviewType } from 'src/jobs/entities/interview/interview-type.entity';
import { Repository } from 'typeorm';
import { CreateInterviewTypeDto } from './dto/create-interview-type.dto';
import { UpdateInterviewTypeDto } from './dto/update-intreview-type.dto';

@Injectable()
export class InterviewTypeService {
      constructor(
        @InjectRepository(InterviewType)
        private readonly repository: Repository<InterviewType>,
    ) {}

    async create(
        dto: CreateInterviewTypeDto,
        user: Users,
    ) {
        try {
            const item = this.repository.create({
                ...dto,
                creator_id: user.id,
                updator_id: user.id,
            });

            const data = await this.repository.save(item);

            return {
                success: true,
                message: 'Interview type created successfully',
                data,
            };
        } catch (error) {
            throw new InternalServerErrorException(error.message);
        }
    }

   async findAll() {
    const data = await this.repository.find({
        select: {
            id: true,
            name: true,
        },
        order: {
            id: 'DESC',
        },
    });

    return {
        success: true,
        message: 'Interview types retrieved successfully',
        data,
    };
}

    async findOne(id: number) {
        const item = await this.repository.findOne({
            where: { id },
        });

        if (!item) {
            throw new NotFoundException(
                'Interview type not found',
            );
        }

        return {
            success: true,
            message: 'Interview type retrieved successfully',
            data: item,
        };
    }

    async update(
        id: number,
        dto: UpdateInterviewTypeDto,
        user: Users,
    ) {
        const item = await this.repository.findOne({
            where: { id },
        });

        if (!item) {
            throw new NotFoundException(
                'Interview type not found',
            );
        }

        Object.assign(item, dto);

        item.updator_id = user.id;

        const data = await this.repository.save(item);

        return {
            success: true,
            message: 'Interview type updated successfully',
            data,
        };
    }

    async remove(id: number) {
        const item = await this.repository.findOne({
            where: { id },
        });

        if (!item) {
            throw new NotFoundException(
                'Interview type not found',
            );
        }

        await this.repository.remove(item);

        return {
            success: true,
            message: 'Interview type deleted successfully',
        };
    }
}
