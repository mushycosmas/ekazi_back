import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Users } from 'src/entities/users.entity';
import { Repository } from 'typeorm';
import { GetUsersByClientDto } from './dto/get-user-by-client.dto';

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(Users)
    private readonly usersRepository: Repository<Users>,
  ) { }

  /**
   * Get all users for a given client, including their role and the
   * role's permissions.
   */
async findByClient(
  user: Users,
  query: Omit<GetUsersByClientDto, 'clientId'>,
): Promise<PaginatedResult<Users>> {

  const clientId = user.client_id;

  if (!clientId) {
    throw new NotFoundException('Client not found');
  }

  const { page = 1, limit = 20 } = query;

  const [data, total] = await this.usersRepository
    .createQueryBuilder('user')

    .select([
      // User
      'user.id',
      'user.username',
      'user.email',
      'user.client_id',
      'user.hide',
      'user.verified',
      'user.created_at',

      // Role
      'role.id',
      'role.name',

      // Role permissions
      'permissions.id',
      'permissions.name',

      // User permissions
      'userPermissions.id',
      'userPermissions.user_id',
      'userPermissions.permission_id',
      'userPermissions.type',

      // User permission details
      'userPermissionPermission.id',
      'userPermissionPermission.name',
    ])

    .leftJoin(
      'user.role',
      'role',
    )
    //   .leftJoin(
    //   'user.role',
    //   'role',
    // )

    .leftJoin(
      'role.permissions',
      'permissions',
    )

    .leftJoin(
      'user.userPermissions',
      'userPermissions',
    )

    .leftJoin(
      'userPermissions.permission',
      'userPermissionPermission',
    )

    .where(
      'user.client_id = :clientId',
      { clientId },
    )

    // Do not return the currently logged-in user
    .andWhere(
      'user.id != :currentUserId',
      { currentUserId: user.id },
    )

    .orderBy(
      'user.id',
      'DESC',
    )

    .skip(
      (page - 1) * limit,
    )

    .take(limit)

    .getManyAndCount();

  return {
    data,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

  /**
   * Get a single user by id scoped to a client, with role + permissions.
   * Useful for authorization checks (e.g. "does this user, who belongs
   * to this client, have permission X?").
   */
 async findOneByClient(
  userId: number,
  clientId: number,
): Promise<Users> {

  const user = await this.usersRepository
    .createQueryBuilder('user')

    // =========================
    // USER ROLE
    // =========================
    .leftJoinAndSelect(
      'user.role',
      'role',
    )

    // =========================
    // ROLE PERMISSIONS
    // =========================
    .leftJoinAndSelect(
      'role.permissions',
      'permissions',
    )

    // =========================
    // USER CUSTOM PERMISSIONS
    // =========================
    .leftJoinAndSelect(
      'user.userPermissions',
      'userPermissions',
    )

    // =========================
    // PERMISSION ATTACHED TO
    // USER PERMISSION
    // =========================
    .leftJoinAndSelect(
      'userPermissions.permission',
      'userPermissionPermission',
    )

    .where(
      'user.id = :userId',
      { userId },
    )

    .andWhere(
      'user.client_id = :clientId',
      { clientId },
    )

    .getOne();

  if (!user) {
    throw new NotFoundException(
      `User ${userId} not found for client ${clientId}`,
    );
  }

  return user;
}
}
