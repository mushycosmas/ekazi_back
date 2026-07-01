import { Injectable } from '@nestjs/common';
import { Users } from 'src/entities/users.entity';
import { InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class EmployerService {
    constructor(
        @InjectRepository(Users)
        private readonly usersRepository: Repository<Users>,
    ) { }
   async employerAccount(user: Users) {
    try {
        const account = await this.usersRepository.findOne({
            where: { id: user.id },
            relations: [
                'role',
                'role.permissions',
            ],
        });

        if (!account) {
            throw new InternalServerErrorException({
                success: false,
                message: 'User account not found',
            });
        }

        return {
            success: true,
            message: 'Successfully retrieved user account',
            data: {
                id: account.id,
                username: account.username,
                email: account.email,
                verified: account.verified,
                role_id: account.role_id,

                role: account.role?.name,

                permissions: account.role?.permissions?.map((p) => ({
                    id: p.id,
                    name: p.name,
                })) || [],
            },
        };
    } catch (error) {
        throw new InternalServerErrorException({
            success: false,
            message: 'Failed to fetch employer account',
            error: error.message,
        });
    }
}
}
