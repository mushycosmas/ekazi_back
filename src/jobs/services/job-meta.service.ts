import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JobMetas } from '../entities/job-metas.entity';
import { Repository } from 'typeorm';
import { CreateJobMetaDto } from '../dtos/create-job-meta.dto';
import { UpdateJobMetaDto } from '../dtos/update-job-meta.dto';
import { Users } from 'src/entities/users.entity';


@Injectable()
export class JobMetaService {

    constructor(
        @InjectRepository(JobMetas)
        private readonly jobMetaRepository: Repository<JobMetas>,
    ) { }


    async create(
        user: Users,
        createDto: CreateJobMetaDto,
    ) {

        if (!user.client_id) {
            throw new NotFoundException(
                'User is not linked to a client',
            );
        }


        const meta = this.jobMetaRepository.create({

            ...createDto,

            creator_id: user.id,

            updator_id: user.id,

            created_at: new Date(),

            updated_at: new Date(),

        });


        await this.jobMetaRepository.save(meta);


        return {

            message: 'Job Meta created successfully',

            success: true,

        };

    }


    async findAll(user: Users) {

        if (user.client_id == null) {
            throw new NotFoundException('User is not linked to a client');
        }

        const clientId = user.client_id;

        return await this.jobMetaRepository.find({
            where: {
                job: {
                    client_id: clientId,
                },
            },
            relations: [
                'job',
                'metaKeyword',
            ],
        });
    }


    async findOne(
        user: Users,
        id: number,
    ) {

        if (user.client_id == null) {
            throw new NotFoundException('User is not linked to a client');
        }

        const clientId = user.client_id;

        const meta = await this.jobMetaRepository.findOne({
            where: {
                id,
                job: {
                    client_id: clientId,
                },
            },
            relations: [
                'job',
                'metaKeyword',
            ],
        });

        if (!meta) {
            throw new NotFoundException(
                `Job Meta with ID ${id} not found`,
            );
        }

        return meta;
    }

    async update(
        user: Users,
        id: number,
        updateDto: UpdateJobMetaDto,
    ) {
        const meta = await this.findOne(
            user,
            id,
        );

        const {
            job_id,
            meta_keyword_id,
            ...rest
        } = updateDto;

        Object.assign(
            meta,
            rest,
        );

        if (job_id) {

            meta.job = {
                id: job_id,
            } as any;

        }

        if (meta_keyword_id) {

            meta.metaKeyword = {
                id: meta_keyword_id,
            } as any;

        }
        meta.updator_id = user.id;

        meta.updated_at = new Date();
        await this.jobMetaRepository.save(meta);

        return {

            message: 'Job Meta updated successfully',

            success: true,

        };

    }

    async remove(
        user: Users,
        id: number,
    ) {

        const meta = await this.findOne(
            user,
            id,
        );

        await this.jobMetaRepository.remove(meta);
        return {

            success: true,

            message: 'Job Meta deleted successfully',

        };

    }

}