import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Users } from 'src/entities/users.entity';
import { Repository } from 'typeorm';

@Injectable()
export class EmployerUserService {
    constructor(
        @InjectRepository(Users)
        private readonly userRepository: Repository<Users>,
    ) { }

    async users(clientId: number) {
        try {
            //   const users = await this.userRepository.find({
            //     where: {
            //       client_id: clientId,
            //     },
            //     relations: [
            //       'role',        // Changed from 'roles' to 'role' (singular)
            //       'permissions',
            //     ],
            //     order: {
            //       created_at: 'DESC',
            //     },
            //   });
            const users = await this.userRepository
                .createQueryBuilder('user')
                .leftJoinAndSelect('user.role', 'role')
                .where('user.client_id = :clientId', { clientId })
                .orderBy('user.created_at', 'DESC')
                .getMany();

            const data = users.map((user) => ({
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role?.name || null,
                created_at: user.created_at,
            }));

            return {
                success: true,
                data,
            };
        } catch (error) {
            throw new InternalServerErrorException({
                success: false,
                message: 'Failed to fetch users',
                error: error.message,
            });
        }
    }
}