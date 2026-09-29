 import {
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { InterviewAction } from 'src/jobs/entities/interview/interview-action.entity';
import { CreateInterviewActionDto } from './dto/create-interview-action.dto';
import { UpdateInterviewActionDto } from './dto/update-interview-action.dto';

@Injectable()
export class InterviewActionService {
    constructor(
        @InjectRepository(InterviewAction)
        private readonly interviewActionRepository:
            Repository<InterviewAction>,
    ) {}

    /**
     * GET ALL
     */
    async index(
        page: number = 1,
        limit: number = 20,
        search: string = '',
    ) {
        const skip = (page - 1) * limit;

        const query =
            this.interviewActionRepository
                .createQueryBuilder('action');

        if (search.trim()) {
            query.where(
                'action.name LIKE :search',
                {
                    search: `%${search.trim()}%`,
                },
            );
        }

        query
            .orderBy('action.id', 'DESC')
            .skip(skip)
            .take(limit);

        const [data, total] =
            await query.getManyAndCount();

        return {
            status: true,
            message:
                'Interview actions retrieved successfully',
            data,
            page,
            limit,
            total,
            totalPages: Math.ceil(
                total / limit,
            ),
        };
    }

    /**
     * GET ONE
     */
    async show(id: number) {
        const action =
            await this.interviewActionRepository.findOne({
                where: { id },
            });

        if (!action) {
            throw new NotFoundException(
                'Interview action not found',
            );
        }

        return {
            status: true,
            message:
                'Interview action retrieved successfully',
            data: action,
        };
    }

    /**
     * CREATE
     */
    async store(dto: CreateInterviewActionDto) {
        const existing =
            await this.interviewActionRepository.findOne({
                where: {
                    name: dto.name,
                },
            });

        if (existing) {
            throw new ConflictException(
                'Interview action already exists',
            );
        }

        const action =
            this.interviewActionRepository.create({
                name: dto.name,
            });

        const saved =
            await this.interviewActionRepository.save(
                action,
            );

        return {
            status: true,
            message:
                'Interview action created successfully',
            data: saved,
        };
    }

    /**
     * UPDATE
     */
    async update(
        id: number,
        dto: UpdateInterviewActionDto,
    ) {
        const action =
            await this.interviewActionRepository.findOne({
                where: { id },
            });

        if (!action) {
            throw new NotFoundException(
                'Interview action not found',
            );
        }

        if (dto.name) {
            const existing =
                await this.interviewActionRepository.findOne({
                    where: {
                        name: dto.name,
                    },
                });

            if (
                existing &&
                existing.id !== id
            ) {
                throw new ConflictException(
                    'Interview action already exists',
                );
            }
        }

        Object.assign(action, dto);

        const updated =
            await this.interviewActionRepository.save(
                action,
            );

        return {
            status: true,
            message:
                'Interview action updated successfully',
            data: updated,
        };
    }

    /**
     * DELETE
     */
    async destroy(id: number) {
        const action =
            await this.interviewActionRepository.findOne({
                where: { id },
            });

        if (!action) {
            throw new NotFoundException(
                'Interview action not found',
            );
        }

        await this.interviewActionRepository.remove(
            action,
        );

        return {
            status: true,
            message:
                'Interview action deleted successfully',
        };
    }
}