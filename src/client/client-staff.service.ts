import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ClientStaff } from './entities/client-staff.entity';
import { Repository } from 'typeorm';
import { CreateClientStaffDto } from './dto/create-client-staff.dto';
import { Users } from 'src/entities/users.entity';
import { UpdateClientStaffDto } from './dto/update-client-staff.dto';

@Injectable()
export class ClientStaffService {
        constructor(

        @InjectRepository(ClientStaff)
        private readonly repository: Repository<ClientStaff>,

    ) {}

    async create(
        dto: CreateClientStaffDto,
        user: Users,
    ) {

        const item = this.repository.create({

            ...dto,

            creator_id: user.id,

            updator_id: user.id,

        });

        return await this.repository.save(item);

    }

  async findAll(
    page = 1,
    limit = 20,
    search?: string,
    clientId?: number,
) {
    try {
        const query = this.repository
            .createQueryBuilder('staff')

            // ======================
            // JOINS
            // ======================
            .leftJoinAndSelect('staff.client', 'client')
            .leftJoinAndSelect('staff.user', 'user')

            // ======================
            // SELECT
            // ======================
            .select([
                'staff.id',
                'staff.prefix_id',
                'staff.client_id',
                'staff.user_id',
                'staff.first_name',
                'staff.middle_name',
                'staff.last_name',
                'staff.phone_number',
                'staff.created_at',

                'client.id',
                'client.client_name',

                'user.id',
                'user.email',
              
            ])

            .orderBy('staff.id', 'DESC');

        // ======================
        // SEARCH
        // ======================
        if (search && search.trim() !== '') {
            const keyword = `%${search.trim()}%`;

            query.andWhere(
                `(
                    staff.first_name LIKE :keyword OR
                    staff.middle_name LIKE :keyword OR
                    staff.last_name LIKE :keyword OR
                    staff.phone_number LIKE :keyword OR
                    user.email LIKE :keyword OR
                    client.client_name LIKE :keyword
                )`,
                { keyword },
            );
        }

        // ======================
        // CLIENT FILTER
        // ======================
        if (clientId) {
            query.andWhere('staff.client_id = :clientId', {
                clientId,
            });
        }

        // ======================
        // COUNT QUERY
        // ======================
        const totalQuery = this.repository
            .createQueryBuilder('staff')
            .leftJoin('staff.client', 'client')
            .leftJoin('staff.user', 'user');

        if (search && search.trim() !== '') {
            const keyword = `%${search.trim()}%`;

            totalQuery.andWhere(
                `(
                    staff.first_name LIKE :keyword OR
                    staff.middle_name LIKE :keyword OR
                    staff.last_name LIKE :keyword OR
                    staff.phone_number LIKE :keyword OR
                    user.email LIKE :keyword OR
                    client.client_name LIKE :keyword
                )`,
                { keyword },
            );
        }

        if (clientId) {
            totalQuery.andWhere(
                'staff.client_id = :clientId',
                {
                    clientId,
                },
            );
        }

        const total = await totalQuery.getCount();

        // ======================
        // PAGINATION
        // ======================
        const data = await query
            .skip((page - 1) * limit)
            .take(limit)
            .getMany();

        return {
            success: true,
            message: 'Client staff fetched successfully',
            data,
            current_page: page,
            per_page: limit,
            total_pages: Math.ceil(total / limit),
            total,
        };
    } catch (error) {
        throw new InternalServerErrorException({
            success: false,
            message: 'Failed to fetch client staff',
            error: error.message,
        });
    }
}

 async findOne(id: number): Promise<ClientStaff> {
    const item = await this.repository
        .createQueryBuilder('staff')
        .leftJoinAndSelect('staff.client', 'client')
        .leftJoinAndSelect('staff.user', 'user')
        .select([
            'staff.id',
            'staff.prefix_id',
            'staff.client_id',
            'staff.user_id',
            'staff.first_name',
            'staff.middle_name',
            'staff.last_name',
            'staff.phone_number',
            'staff.created_at',
            'staff.updated_at',

            'client.id',
            'client.client_name',

            'user.id',
            'user.email',
        ])
        .where('staff.id = :id', { id })
        .getOne();

    if (!item) {
        throw new NotFoundException('Staff not found');
    }

    return item;
}

    async update(

        id: number,

        dto: UpdateClientStaffDto,

        user: Users,

    ) {

        const item = await this.findOne(id);

        Object.assign(

            item,

            dto,

            {

                updator_id: user.id,

            },

        );

        return await this.repository.save(item);

    }

    async remove(id: number) {

        const item = await this.findOne(id);

        await this.repository.remove(item);

        return {

            success: true,

            message: 'Staff deleted successfully',

        };

    }

}
