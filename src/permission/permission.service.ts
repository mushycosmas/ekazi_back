import {
    Injectable,
    NotFoundException,
    ConflictException,
} from '@nestjs/common';

import {
    InjectRepository,
} from '@nestjs/typeorm';

import {
    Repository,
} from 'typeorm';

import {
    Permission,
} from 'src/entities/permission.entity';

import {
    CreatePermissionDto,
} from './dto/create-permission.dto';

import {
    UpdatePermissionDto,
} from './dto/update-permission.dto';

@Injectable()
export class PermissionService {

    constructor(

        @InjectRepository(Permission)
        private readonly permissionRepository:
            Repository<Permission>,

    ) { }

    // ==========================================
    // GET PERMISSION ENTITY
    // INTERNAL USE
    // ==========================================

    private async getPermissionById(
        id: number,
    ): Promise<Permission> {

        const permission =
            await this.permissionRepository.findOne({
                where: {
                    id,
                },
            });

        if (!permission) {

            throw new NotFoundException(
                `Permission with ID ${id} not found`,
            );

        }

        return permission;
    }

    // ==========================================
    // CREATE
    // ==========================================

    async create(
        dto: CreatePermissionDto,
    ) {

        const existingPermission =
            await this.permissionRepository.findOne({
                where: {
                    name: dto.name,
                },
            });

        if (existingPermission) {

            throw new ConflictException(
                'Permission already exists',
            );

        }

        const permission =
            this.permissionRepository.create({

                name:
                    dto.name,

                guardName:
                    dto.guard_name ?? 'web',
                //   creeated_at: new Date(),
                  createdAt: new Date(),
                  updatedAt:new Date(),

            });

        const data =
            await this.permissionRepository.save(
                permission,
            );

        return {

            success: true,

            message:
                'Permission created successfully',

            data,

        };
    }

    // ==========================================
    // FIND ALL
    // ==========================================

    async findAll(
        page: number = 1,
        limit: number = 20,
    ) {

        page =
            Math.max(page, 1);

        limit =
            Math.min(
                Math.max(limit, 1),
                100,
            );

        const skip =
            (page - 1) * limit;

        const [data, total] =
            await this.permissionRepository.findAndCount({

                order: {
                    id: 'DESC',
                },

                skip,

                take: limit,

            });

        return {

            success: true,

            message:
                'Permissions retrieved successfully',

            data,
            total,

            page,

            limit,

            totalPages:
                Math.ceil(
                    total / limit,
                ),
        };
    }

    // ==========================================
    // FIND ONE
    // ==========================================

    async findOne(
        id: number,
    ) {

        const data =
            await this.getPermissionById(
                id,
            );

        return {

            success: true,

            message:
                'Permission retrieved successfully',

            data,

        };
    }

    // ==========================================
    // UPDATE
    // ==========================================

    async update(

        id: number,

        dto: UpdatePermissionDto,

    ) {

        const permission =
            await this.getPermissionById(
                id,
            );

        // ==========================================
        // CHECK DUPLICATE NAME
        // ==========================================

        if (
            dto.name !== undefined &&
            dto.name !== permission.name
        ) {

            const existingPermission =
                await this.permissionRepository.findOne({

                    where: {
                        name:
                            dto.name,
                    },

                });

            if (existingPermission) {

                throw new ConflictException(
                    'Permission name already exists',
                );

            }

        }

        // ==========================================
        // UPDATE NAME
        // ==========================================

        if (
            dto.name !== undefined
        ) {

            permission.name =
                dto.name;

        }

        // ==========================================
        // UPDATE GUARD NAME
        // ==========================================

        if (
            dto.guard_name !== undefined
        ) {

            permission.guardName =
                dto.guard_name;

        }

        const data =
            await this.permissionRepository.save(
                permission,
            );

        return {

            success: true,

            message:
                'Permission updated successfully',

            data,

        };
    }

    // ==========================================
    // DELETE
    // ==========================================

    async remove(
        id: number,
    ) {

        const permission =
            await this.getPermissionById(
                id,
            );

        await this.permissionRepository.remove(
            permission,
        );

        return {

            success: true,

            message:
                'Permission deleted successfully',

        };
    }
}