import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ClientStaff } from './entities/client-staff.entity';
import { Repository } from 'typeorm';
import { CreateClientStaffDto } from './dto/create-client-staff.dto';
import { Users } from 'src/entities/users.entity';
import { UpdateClientStaffDto } from './dto/update-client-staff.dto';
import { UserPermission } from 'src/entities/user-permission.entity';
import * as bcrypt from 'bcrypt';
import { execSync } from 'child_process';
import { Logger } from '@nestjs/common';
import { MailService } from 'src/mail/mail.service';
import * as fs from 'fs';
import * as path from 'path';
import { Clients } from './clients.entity';
import * as Handlebars from 'handlebars';


@Injectable()
export class ClientStaffService {

    private readonly logger = new Logger(ClientStaffService.name);

    constructor(
        @InjectRepository(ClientStaff)
        private readonly repository: Repository<ClientStaff>,

        @InjectRepository(Clients)
        private readonly clientsRepository: Repository<Clients>,

        private readonly mailService: MailService,
    ) { }

    private generateMoodlePassword(password: string): string {
        try {
            const hash = execSync(
                `php -r "echo password_hash('${password}', PASSWORD_BCRYPT);"`
            )
                .toString()
                .trim();

            return hash;

        } catch (error) {
            console.error('Moodle password hash generation failed:', error);
            throw new Error('Unable to generate Moodle password');
        }
    }
 async create(
    dto: CreateClientStaffDto,
    currentUser: Users,
) {
    const queryRunner =
        this.repository.manager.connection.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    let savedUser: Users;
    let savedStaff: ClientStaff;
    let staffWithPosition: ClientStaff | null = null;

    try {

        // ==================================================
        // VALIDATE CURRENT USER CLIENT
        // ==================================================

        if (!currentUser.client_id) {
            throw new NotFoundException(
                'Client not found',
            );
        }

        if (!currentUser.role_id) {
            throw new NotFoundException(
                'Current user role not found',
            );
        }

        // ==================================================
        // CREATE USER
        // ==================================================

        const newUser =
            queryRunner.manager.create(
                Users,
                {
                    username:
                        dto.username,

                    email:
                        dto.email,

                    temp_email:
                        dto.email,

                    password:
                        this.generateMoodlePassword(
                            dto.password,
                        ),

                    // IMPORTANT:
                    // Client comes from logged-in user
                    client_id:
                        currentUser.client_id,

                    // IMPORTANT:
                    // Role comes from logged-in user
                    role_id:
                        currentUser.role_id,

                    created_at:
                        new Date(),

                    updated_at:
                        new Date(),

                    creator_id:
                        currentUser.id,

                    updator_id:
                        currentUser.id,

                    hide:
                        false,

                    verified:
                        true,

                    email_verified_at:
                        new Date(),
                },
            );

        savedUser =
            await queryRunner.manager.save(
                Users,
                newUser,
            );

        // ==================================================
        // CREATE CLIENT STAFF
        // ==================================================

        const staff =
            queryRunner.manager.create(
                ClientStaff,
                {
                    prefix_id:
                        dto.prefix_id,

                    client_id:
                        currentUser.client_id,

                    user_id:
                        savedUser.id,

                    // STAFF POSITION
                    client_staff_position_id:
                        dto.client_staff_position_id,

                    first_name:
                        dto.first_name,

                    middle_name:
                        dto.middle_name,

                    last_name:
                        dto.last_name,

                    phone_number:
                        dto.phone_number,

                    creator_id:
                        currentUser.id,

                    updator_id:
                        currentUser.id,
                },
            );

        savedStaff =
            await queryRunner.manager.save(
                ClientStaff,
                staff,
            );

        // ==================================================
        // USER CUSTOM PERMISSIONS
        // ==================================================

        if (
            dto.user_permissions &&
            dto.user_permissions.length > 0
        ) {

            const userPermissions =
                dto.user_permissions.map(
                    (permission) =>
                        queryRunner.manager.create(
                            UserPermission,
                            {
                                user_id:
                                    savedUser.id,

                                permission_id:
                                    permission.permission_id,

                                type:
                                    permission.type,
                            },
                        ),
                );

            await queryRunner.manager.save(
                UserPermission,
                userPermissions,
            );
        }

        // ==================================================
        // COMMIT TRANSACTION
        // ==================================================

        await queryRunner.commitTransaction();

    } catch (error) {

        // ==================================================
        // ROLLBACK
        // ==================================================

        await queryRunner.rollbackTransaction();

        if (
            error instanceof NotFoundException
        ) {
            throw error;
        }

        throw new InternalServerErrorException({
            success: false,

            message:
                'Failed to create client staff',

            error:
                error instanceof Error
                    ? error.message
                    : String(error),
        });

    } finally {

        await queryRunner.release();

    }

    // ==================================================
    // LOAD STAFF WITH POSITION
    // ==================================================
    //
    // Transaction is already committed here.
    //

    staffWithPosition =
        await this.repository.findOne({
            where: {
                id: savedStaff.id,
            },

            relations: [
                'position',
                'user',
            ],
        });

    if (!staffWithPosition) {
        throw new NotFoundException(
            'Created staff could not be found',
        );
    }

    // ==================================================
    // GET CLIENT
    // ==================================================

    const client =
        await this.clientsRepository.findOne({
            where: {
                id: currentUser.client_id,
            },

            relations: [
                'emails',
            ],
        });

    if (!client) {
        throw new NotFoundException(
            'Company not found',
        );
    }

    // ==================================================
    // GET CLIENT EMAIL
    // ==================================================

    const clientEmail =
        client.emails?.[0]?.client_email ?? '';

    // ==================================================
    // SEND ACCOUNT EMAIL
    // ==================================================

    try {

        await this.sendClientStaffAccountEmail({

            staff: {

                ...staffWithPosition,

                email:
                    savedUser.email,

                user:
                    savedUser,
            },

            username:
                savedUser.username ??
                dto.username,

            password:
                dto.password,

            client: {

                client_name:
                    client.client_name ?? '',

                email:
                    clientEmail,
            },

        });

        // ==================================================
        // EMAIL SUCCESS LOG
        // ==================================================

        this.logger.log(
            `Client staff account email sent successfully to ${savedUser.email}`,
        );

    } catch (emailError) {

        // ==================================================
        // EMAIL ERROR
        // ==================================================

        console.error(
            'CLIENT STAFF EMAIL FAILED:',
            emailError,
        );

        this.logger.error(
            `Client staff account was created, but email failed: ${
                emailError instanceof Error
                    ? emailError.message
                    : String(emailError)
            }`,
        );

        // IMPORTANT:
        // Do NOT throw here.
        //
        // The staff account has already been successfully
        // created and the transaction has already committed.
    }

    // ==================================================
    // RESPONSE
    // ==================================================

    return {

        success:
            true,

        message:
            'Client staff created successfully',

        data: {

            staff_id:
                savedStaff.id,

            user_id:
                savedUser.id,

            username:
                savedUser.username,

            email:
                savedUser.email,

            // Current user's role
            role_id:
                savedUser.role_id,

            client_staff_position_id:
                savedStaff.client_staff_position_id,

            position_name:
                staffWithPosition.position?.position_name ??
                null,

        },

    };
}

    async findAll(
        page = 1,
        limit = 20,
        search?: string,
        clientId?: number,
    ) {
        try {
            // ======================
            // PAGINATION VALIDATION
            // ======================
            page = Math.max(1, Number(page) || 1);
            limit = Math.min(100, Math.max(1, Number(limit) || 20));

            if (!clientId) {
                throw new NotFoundException('Client not found');
            }

            // ======================
            // MAIN QUERY
            // ======================
            const query = this.repository
                .createQueryBuilder('staff')

                // ======================
                // JOINS
                // ======================
                .leftJoinAndSelect('staff.client', 'client')
                .leftJoinAndSelect('staff.user', 'user')

                // Staff Position
                .leftJoinAndSelect(
                    'staff.position',
                    'position',
                )

                // User Role
                .leftJoinAndSelect('user.role', 'role')

                // Role Permissions
                .leftJoinAndSelect(
                    'role.permissions',
                    'permissions',
                )

                // User Permissions
                .leftJoinAndSelect(
                    'user.userPermissions',
                    'userPermissions',
                )

                // User Permission Details
                .leftJoinAndSelect(
                    'userPermissions.permission',
                    'userPermissionPermission',
                )

                // ======================
                // SELECT
                // ======================
                .select([
                    // Staff
                    'staff.id',
                    'staff.prefix_id',
                    'staff.client_id',
                    'staff.user_id',
                    'staff.client_staff_position_id',
                    'staff.first_name',
                    'staff.middle_name',
                    'staff.last_name',
                    'staff.phone_number',
                    'staff.created_at',


                    // Client
                    // 'client.id',
                    // 'client.client_name',

                    // Client Staff Position
                    'position.id',
                    'position.position_name',

                    // User
                    'user.id',
                    'user.username',
                    'user.email',
                    'user.client_id',
                    //'user.hide',
                    // 'user.verified',
                    // 'user.created_at',

                    // Role
                    'role.id',
                    'role.name',

                    // Role Permissions
                    'permissions.id',
                    'permissions.name',

                    // User Permissions
                    'userPermissions.id',
                    'userPermissions.user_id',
                    'userPermissions.permission_id',
                    'userPermissions.type',

                    // User Permission Details
                    'userPermissionPermission.id',
                    'userPermissionPermission.name',
                ])

                // ======================
                // CLIENT FILTER
                // ======================
                .where(
                    'staff.client_id = :clientId',
                    { clientId },
                )

                .orderBy('staff.id', 'DESC');

            // ======================
            // SEARCH
            // ======================
            if (search?.trim()) {
                const keyword = `%${search.trim()}%`;

                query.andWhere(
                    `(
                    staff.first_name LIKE :keyword OR
                    staff.middle_name LIKE :keyword OR
                    staff.last_name LIKE :keyword OR
                    staff.phone_number LIKE :keyword OR
                    user.email LIKE :keyword OR
                    user.username LIKE :keyword OR
                    client.client_name LIKE :keyword OR
                    position.position_name LIKE :keyword OR
                    role.name LIKE :keyword
                    )`,
                    { keyword },
                );
            }

            // ======================
            // COUNT QUERY
            // ======================
            const totalQuery = this.repository
                .createQueryBuilder('staff')
                .leftJoin('staff.client', 'client')
                .leftJoin('staff.user', 'user')
                .leftJoin('staff.position', 'position')
                .leftJoin('user.role', 'role')
                .where(
                    'staff.client_id = :clientId',
                    { clientId },
                );

            // ======================
            // SEARCH FOR COUNT
            // ======================
            if (search?.trim()) {
                const keyword = `%${search.trim()}%`;

                totalQuery.andWhere(
                    `(
                    staff.first_name LIKE :keyword OR
                    staff.middle_name LIKE :keyword OR
                    staff.last_name LIKE :keyword OR
                    staff.phone_number LIKE :keyword OR
                    user.email LIKE :keyword OR
                    user.username LIKE :keyword OR
                    client.client_name LIKE :keyword OR
                    position.position_name LIKE :keyword OR
                    role.name LIKE :keyword
                    )`,
                    { keyword },
                );
            }

            const total = await totalQuery.getCount();

            // ======================
            // GET PAGINATED DATA
            // ======================
            const data = await query
                .skip((page - 1) * limit)
                .take(limit)
                .getMany();

            return {
                success: true,
                message: 'Client staff fetched successfully',
                data,
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            };

        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }

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

            // ======================
            // JOINS
            // ======================
            // .leftJoinAndSelect('staff.client', 'client')
            .leftJoinAndSelect('staff.user', 'user')

            // Client Staff Position
            .leftJoinAndSelect(
                'staff.position',
                'position',
            )

            // User Role
            .leftJoinAndSelect('user.role', 'role')

            // Role Permissions
            .leftJoinAndSelect(
                'role.permissions',
                'permissions',
            )

            // User Permissions
            .leftJoinAndSelect(
                'user.userPermissions',
                'userPermissions',
            )

            // User Permission Details
            .leftJoinAndSelect(
                'userPermissions.permission',
                'userPermissionPermission',
            )

            // ======================
            // SELECT
            // ======================
            .select([
                // Staff
                'staff.id',
                'staff.prefix_id',
                'staff.client_id',
                'staff.user_id',
                'staff.client_staff_position_id',
                'staff.first_name',
                'staff.middle_name',
                'staff.last_name',
                'staff.phone_number',
                'staff.created_at',

                // Client
                // 'client.id',
                // 'client.client_name',

                // Client Staff Position
                'position.id',
                'position.position_name',

                // User
                'user.id',
                'user.username',
                'user.email',
                // 'user.client_id',
                // 'user.hide',
                // 'user.verified',
                // 'user.created_at',

                // Role
                'role.id',
                'role.name',

                // Role Permissions
                'permissions.id',
                'permissions.name',

                // User Permissions
                'userPermissions.id',
                'userPermissions.user_id',
                'userPermissions.permission_id',
                'userPermissions.type',

                // User Permission Details
                'userPermissionPermission.id',
                'userPermissionPermission.name',
            ])

            // ======================
            // WHERE
            // ======================
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
    currentUser: Users,
) {
    const queryRunner =
        this.repository.manager.connection.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {

        // ==========================================
        // CLIENT
        // ==========================================

        if (!currentUser.client_id) {
            throw new NotFoundException(
                'Client not found',
            );
        }

        // ==========================================
        // FIND STAFF
        // ==========================================

        const staff =
            await queryRunner.manager.findOne(
                ClientStaff,
                {
                    where: {
                        id,
                        client_id:
                            currentUser.client_id,
                    },
                    relations: [
                        'user',
                        'position',
                    ],
                },
            );

        if (!staff) {
            throw new NotFoundException(
                'Staff not found',
            );
        }

        // ==========================================
        // UPDATE STAFF
        // ==========================================

        if (dto.prefix_id !== undefined) {
            staff.prefix_id =
                dto.prefix_id;
        }

        if (
            dto.client_staff_position_id !==
            undefined
        ) {
            staff.client_staff_position_id =
                dto.client_staff_position_id;
        }

        if (dto.first_name !== undefined) {
            staff.first_name =
                dto.first_name;
        }

        if (dto.middle_name !== undefined) {
            staff.middle_name =
                dto.middle_name;
        }

        if (dto.last_name !== undefined) {
            staff.last_name =
                dto.last_name;
        }

        if (dto.phone_number !== undefined) {
            staff.phone_number =
                dto.phone_number;
        }

        staff.updator_id =
            currentUser.id;

        await queryRunner.manager.save(
            ClientStaff,
            staff,
        );

        // ==========================================
        // USER ACCOUNT
        // ==========================================

        if (!staff.user_id) {
            throw new NotFoundException(
                'Staff user account not found',
            );
        }

        const staffUser =
            await queryRunner.manager.findOne(
                Users,
                {
                    where: {
                        id: staff.user_id,
                    },
                },
            );

        if (!staffUser) {
            throw new NotFoundException(
                'User account not found',
            );
        }

        // ==========================================
        // USERNAME
        // ==========================================

        if (dto.username !== undefined) {
            staffUser.username =
                dto.username;
        }

        // ==========================================
        // EMAIL
        // ==========================================

        if (dto.email !== undefined) {

            staffUser.email =
                dto.email;

            staffUser.temp_email =
                dto.email;
        }

        // ==========================================
        // ROLE
        // ==========================================
        //
        // Do NOT accept role_id from DTO.
        // Staff keeps the current user's role.
        //

        staffUser.role_id =
            currentUser.role_id;

        staffUser.updator_id =
            currentUser.id;

        staffUser.updated_at =
            new Date();

        await queryRunner.manager.save(
            Users,
            staffUser,
        );

        // ==========================================
        // USER PERMISSIONS
        // ==========================================

        if (
            dto.user_permissions !==
            undefined
        ) {

            // Remove old custom permissions
            await queryRunner.manager.delete(
                UserPermission,
                {
                    user_id:
                        staffUser.id,
                },
            );

            // Create new permissions
            if (
                dto.user_permissions.length >
                0
            ) {

                const userPermissions =
                    dto.user_permissions.map(
                        permission =>
                            queryRunner.manager.create(
                                UserPermission,
                                {
                                    user_id:
                                        staffUser.id,

                                    permission_id:
                                        permission.permission_id,

                                    type:
                                        permission.type,
                                },
                            ),
                    );

                await queryRunner.manager.save(
                    UserPermission,
                    userPermissions,
                );
            }
        }

        // ==========================================
        // COMMIT
        // ==========================================

        await queryRunner.commitTransaction();

        // ==========================================
        // GET UPDATED STAFF
        // ==========================================

        const updatedStaff =
            await this.repository.findOne({
                where: {
                    id: staff.id,
                },
                relations: [
                    'client',
                    'user',
                    'position',
                ],
            });

        if (!updatedStaff) {
            throw new NotFoundException(
                'Updated staff not found',
            );
        }

        // ==========================================
        // RESPONSE
        // ==========================================

        return {
            success: true,

            message:
                'Client staff updated successfully',

            data: updatedStaff,
        };

    } catch (error) {

        // ==========================================
        // ROLLBACK
        // ==========================================

        await queryRunner.rollbackTransaction();

        if (
            error instanceof NotFoundException
        ) {
            throw error;
        }

        throw new InternalServerErrorException({
            success: false,

            message:
                'Failed to update client staff',

            error:
                error instanceof Error
                    ? error.message
                    : String(error),
        });

    } finally {

        await queryRunner.release();

    }
}

    async remove(id: number) {

        const item = await this.findOne(id);

        await this.repository.remove(item);

        return {

            success: true,

            message: 'Staff deleted successfully',

        };

    }
    private async sendClientStaffAccountEmail({
        staff,
        username,
        password,
        client,
    }: {
        staff: any;
        username: string;
        password: string;
        client: any;
    }) {
        try {

            const staffEmail =
                staff.email ??
                staff.user?.email ??
                '';

            if (!staffEmail) {
                throw new Error(
                    'Client staff email address is missing',
                );
            }

            const templateData = {

                subject:
                    `Your eKazi Staff Account – ${staff.first_name} ${staff.last_name}`,

                first_name:
                    staff.first_name ?? '',

                middle_name:
                    staff.middle_name ?? '',

                last_name:
                    staff.last_name ?? '',

                full_name:
                    [
                        staff.first_name,
                        staff.middle_name,
                        staff.last_name,
                    ]
                        .filter(Boolean)
                        .join(' '),

                phone_number:
                    staff.phone_number ?? '',

                position_name:
                    staff.position?.position_name ??
                    'Staff Member',

                client_name:
                    client?.client_name ?? '',

                username,

                email:
                    staffEmail,

                password,

                login_url:
                    process.env.APP_2_URL ??
                    'https://ekazi.co.tz',

                company_name:
                    process.env.APP_NAME ??
                    'eKazi',

            };

            const templatePath =
                path.join(
                    process.cwd(),
                    'src',
                    'mail',
                    'templates',
                    'client-staff-account-created.template.html',
                );

            const source =
                fs.readFileSync(
                    templatePath,
                    'utf8',
                );

            const template =
                Handlebars.compile(source);

            const html =
                template(templateData);

            await this.mailService.sendMail({

                from:
                    `"${process.env.MAIL_FROM_NAME}" <${process.env.MAIL_FROM_ADDRESS}>`,

                to:
                    templateData.email,

                subject:
                    templateData.subject,

                html,

            });

            this.logger.log(
                `Client staff account email sent successfully to ${staffEmail}`,
            );

        } catch (error) {

            this.logger.error(
                `Failed to send client staff account email: ${error.message}`,
                error.stack,
            );

            throw error;
        }
    }

}
