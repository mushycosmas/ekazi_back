import { ConflictException, flatten, HttpException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { randomBytes, createHash, createHmac } from 'crypto';
import * as bcrypt from 'bcryptjs';
import { ChangePasswordDto } from './dto/chage-password.dto';
import { PasswordReset } from 'src/entities/password-resets.entity';
import { MailService } from 'src/mail/mail.service';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { EmailVerification } from 'src/entities/email-verification.entity';
import { ConfigService } from '@nestjs/config';
import { InternalServerErrorException } from '@nestjs/common';
import { PersonalAccessToken } from 'src/entities/personal-access-token.entity';
import { Users } from 'src/entities/users.entity';
import { CreateEmployerDto } from 'src/employer/dto/create-employer.dto';
import { BadRequestException } from '@nestjs/common';
import { Role } from 'src/entities/role.entity';
import { Clients } from 'src/client/clients.entity';
import { ClientEmail } from 'src/client/entities/client-email.entity';
import { ClientPhone } from 'src/client/entities/client-phones.entity';
import { Notification } from 'src/client/entities/notifications.entity';
import { Applicants } from 'src/entities/applicants/applicants.entity';
import { ApplicantPhones } from 'src/entities/applicants/applicant-phones.entity';
import { ApplicantAddresses } from 'src/entities/applicants/applicant-addresses.entity';
import { RegisterApplicantDto } from './dto/register-applicant.dto';




@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(Users)
        private readonly usersRepository: Repository<Users>,

        @InjectRepository(Role)
        private readonly roleRepository: Repository<Role>,

        @InjectRepository(Clients)
        private clientRepo: Repository<Clients>,


        @InjectRepository(ClientEmail)
        private clientEmailRepo: Repository<ClientEmail>,

        @InjectRepository(ClientPhone)
        private clientPhoneRepo: Repository<ClientPhone>,

        @InjectRepository(Notification)
        private notificationRepo: Repository<Notification>,

        @InjectRepository(PersonalAccessToken)
        private readonly tokenRepository: Repository<PersonalAccessToken>,

        @InjectRepository(PasswordReset)
        private readonly passwordResetRepository: Repository<PasswordReset>,
        @InjectRepository(Applicants)
        private readonly applicantsRepository: Repository<Applicants>,

        @InjectRepository(ApplicantPhones)
        private readonly applicantPhonesRepository: Repository<ApplicantPhones>,

        private readonly dataSource: DataSource,

        @InjectRepository(EmailVerification)
        private emailVerificationRepository: Repository<EmailVerification>,

        private readonly mailService: MailService,
        private configService: ConfigService, // ✅ ADD THIS


    ) { }



    async registerEmployer(dto: CreateEmployerDto) {
        try {
            console.log('🚀 START registerEmployer:', dto.email);

            // =========================
            // CHECK EXISTING USER
            // =========================
            const existing = await this.usersRepository.findOne({
                where: { email: dto.email },
            });

            if (existing) {
                throw new BadRequestException({
                    success: false,
                    message: 'Email already exists',
                });
            }

            console.log('✅ Email is unique');

            // =========================
            // ROLE CHECK
            // =========================
            const role = await this.roleRepository.findOne({
                where: { name: 'Post Jobs Only' },
            });

            if (!role) {
                throw new BadRequestException(

                    {
                        success: false,
                        message: 'Role not found',
                    }
                );
            }

            console.log('✅ Role found:', role.id);

            // =========================
            // HASH PASSWORD
            // =========================
            const hashedPassword = await bcrypt.hash(dto.password, 10);

            console.log('🔐 Password hashed');

            const now = new Date();

            // =========================
            // CREATE USER
            // =========================
            const user = this.usersRepository.create({
                username: dto.name,
                email: dto.email,
                temp_email: dto.email,
                password: hashedPassword,
                role_id: role.id,
                hide: false,
                verified: false, // ✅ ALWAYS UNVERIFIED ON REGISTER

                verify_key: dto.email + new Date().toISOString().slice(0, 10),
                created_at: now,
                updated_at: now,
            });

            await this.usersRepository.save(user);

            console.log('👤 User created:', user.id);

            // =========================
            // CREATE CLIENT
            // =========================
            const client = this.clientRepo.create({
                creator_id: user.id,
                updator_id: user.id,
                type_id: dto.type,
                client_name: dto.name,
                first_name: dto.first_name,
                last_name: dto.last_name,
                middle_name: dto.middle_name,
                client_type: dto.client_type,
            });

            await this.clientRepo.save(client);

            console.log('🏢 Client created:', client.id);

            // link user
            user.client_id = client.id;
            await this.usersRepository.save(user);

            // =========================
            // EMAIL
            // =========================
            await this.clientEmailRepo.save({
                client_email: dto.email,
                client_id: client.id,
            });

            console.log('📧 Email saved');

            // =========================
            // PHONE
            // =========================
            if (dto.phone) {
                await this.clientPhoneRepo.save({
                    phone_number: dto.phone,
                    client_id: client.id,
                });

                console.log('📞 Phone saved');
            }

            // =========================
            // NOTIFICATION
            // =========================
            await this.notificationRepo.save({
                client_id: client.id,
                data: 'New Client Joined',
                type: 'new-client',
            });

            console.log('🔔 Notification sent');

            // =========================
            // VALIDATION CHECKS
            // =========================
            if (!user.email || !user.username) {
                throw new BadRequestException(
                    {
                        success: false,
                        message: 'User data incomplete',

                    }
                );
            }

            // // =========================
            // // EMAIL VERIFICATION
            // // =========================
            // await this.sendVerificationEmail(user.email, user.username);
            // =========================
            // PAYMENT AUTHORIZATION
            // =========================
            // User is registered but NOT verified and NOT logged in.
            // Payment must happen before email verification.
            const paymentToken = await this.createRegistrationPaymentToken(
                user.id,
            );

            console.log('💳 Registration payment token generated');

            return {
                success: true,
                message: 'Employer account created successfully. Please complete subscription payment.',
                data: {
                    id: user.id,
                    email: user.email,
                    client_id: client.id,
                    payment_required: true,
                    payment_token: paymentToken,
                },
            };
        } catch (error) {
            console.error('❌ registerEmployer ERROR:', {
                message: error.message,
                stack: error.stack,
                dto,
            });

            throw new InternalServerErrorException({
                success: false,
                message: 'Failed to register employer',
                error: error.message,
            });
        }
    }
    private async createRegistrationPaymentToken(
        userId: number,
    ): Promise<string> {
        // Generate the same token format used by login()
        const plainToken = randomBytes(40).toString('hex');

        // Store only the SHA256 hash in personal_access_tokens
        const hashedToken = createHash('sha256')
            .update(plainToken)
            .digest('hex');

        const token = this.tokenRepository.create({
            tokenable_type: 'Users',
            tokenable_id: userId,
            name: 'api-token',
            token: hashedToken,
            abilities: '["*"]',
            expires_at: new Date(
                Date.now() + 30 * 24 * 60 * 60 * 1000,
            ),
        });

        await this.tokenRepository.save(token);

        // Return the plain token to the frontend
        return plainToken;
    }

    async login(username: string, password: string) {
        const user = await this.usersRepository.findOne({
            where: { email: username },
            relations: ['role'],
        });

        if (!user) {
            throw new UnauthorizedException(
                'Invalid credentials not user',
            );
        }

        if (!user.password) {
            throw new UnauthorizedException(
                'Invalid credentials not have password',
            );
        }

        const valid = await bcrypt.compare(
            password,
            user.password,
        );

        if (!valid) {
            throw new UnauthorizedException(
                'Invalid credentials',
            );
        }

        // =========================
        // EMAIL VERIFICATION CHECK
        // =========================
        if (user.verified !== true) {
            throw new UnauthorizedException({
                success: false,
                message: 'Please verify your email before logging in',
                data: user.verified,
            });
        }
        console.log("login", user.verified)

        // Generate plain token
        const plainToken = randomBytes(40).toString('hex');

        const hashedToken = createHash('sha256')
            .update(plainToken)
            .digest('hex');

        const token = this.tokenRepository.create({
            tokenable_type: 'Users',
            tokenable_id: user.id,
            name: 'api-token',
            token: hashedToken,
            abilities: '["*"]',
            expires_at: new Date(
                Date.now() + 30 * 24 * 60 * 60 * 1000,
            ),
        });

        await this.tokenRepository.save(token);

        return {
            success: true,
            token: plainToken,
            data: user,
        };
    }

    async logout(req: any) {
        const token = req.token; // comes from SanctumGuard

        if (!token) {
            throw new UnauthorizedException('No token found');
        }

        await this.tokenRepository.delete({
            id: token.id,
        });

        return {
            success: true,
            message: 'Logged out successfully',
        };
    }
    async changePassword(user: Users, dto: ChangePasswordDto) {
        if (!user) {
            throw new UnauthorizedException('User not found');
        }
        if (!user.password) {
            throw new UnauthorizedException('User has no password set');
        }
        // check current password
        const valid = await bcrypt.compare(dto.currentPassword, user.password);

        if (!valid) {
            throw new UnauthorizedException('Current password is incorrect');
        }

        // hash new password
        const hashedPassword = await bcrypt.hash(dto.newPassword, 10);

        user.password = hashedPassword;

        await this.usersRepository.save(user);

        return {
            success: true,
            message: 'Password changed successfully',
        };
    }


    async forgotPassword(email: string) {
        try {
            console.log('[FORGOT PASSWORD] Request received:', {
                email,
                time: new Date().toISOString(),
            });

            const user = await this.usersRepository.findOne({
                where: { email },
            });

            // Prevent email enumeration
            if (!user) {
                console.log('[FORGOT PASSWORD] User not found:', email);

                return {
                    success: true,
                    message:
                        'If the email exists, a password reset code has been sent.',
                };
            }

            console.log('[FORGOT PASSWORD] User found:', {
                id: user.id,
                email: user.email,
            });

            // Generate plain token
            const plainToken = randomBytes(32).toString('hex');

            // Hash before saving
            const hashedToken = createHash('sha256')
                .update(plainToken)
                .digest('hex');

            console.log('[FORGOT PASSWORD] Generated token');

            // Remove old tokens
            await this.passwordResetRepository.delete({ email });

            console.log('[FORGOT PASSWORD] Old reset tokens cleared');

            // Save hashed token
            await this.passwordResetRepository.save({
                email,
                token: hashedToken,
                expires_at: new Date(Date.now() + 15 * 60 * 1000),
            });

            console.log('[FORGOT PASSWORD] Token saved');

            // Send plain token to email
            await this.mailService.sendPasswordReset(email, plainToken);

            console.log('[FORGOT PASSWORD] Email sent successfully');

            return {
                success: true,
                message:
                    'A password reset link has been sent to your email.',
            };
        } catch (error) {
            console.error('[FORGOT PASSWORD ERROR]', {
                message: error.message,
                stack: error.stack,
                email,
            });

            return {
                success: false,
                message: 'Failed to process forgot password request',
                error: error.message,
            };
        }
    }

    async resetPassword(dto: ResetPasswordDto) {
        const { email, token, newPassword } = dto;

        // 1. Find reset record
        const resetRecord = await this.passwordResetRepository.findOne({
            where: { email },
        });

        if (!resetRecord) {
            throw new UnauthorizedException('Invalid or expired reset token');
        }

        // 2. Check token match
        const hashedToken = createHash('sha256').update(token).digest('hex');

        if (hashedToken !== resetRecord.token) {
            throw new UnauthorizedException('Invalid reset token');
        }

        // 3. Check expiry (15 min)
        const isExpired =
            new Date(resetRecord.created_at).getTime() +
            15 * 60 * 1000 <
            Date.now();

        if (isExpired) {
            await this.passwordResetRepository.delete({ email });
            throw new UnauthorizedException('Reset token expired');
        }

        // 4. Find user
        const user = await this.usersRepository.findOne({
            where: { email },
        });

        if (!user) {
            throw new UnauthorizedException('User not found');
        }

        // 5. Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        user.password = hashedPassword;
        await this.usersRepository.save(user);

        // 6. Delete reset token
        await this.passwordResetRepository.delete({ email });

        return {
            success: true,
            message: 'Password reset successfully',
        };
    }


    // ===============================
    // SEND VERIFICATION EMAIL (NO DB)
    // ===============================
    // async sendVerificationEmail(email: string, username: string) {
    //     const secret = this.configService.get('APP_KEY');

    //     const token = randomBytes(32).toString('hex');

    //     const signature = createHmac('sha256', secret)
    //         .update(token + email)
    //         .digest('hex');

    //     const fullToken = `${token}.${signature}`;

    //     const verifyLink = `${this.configService.get(
    //         'FRONTEND_URL',
    //     )}/verify-email?token=${fullToken}&email=${email}`;

    //     await this.mailService.sendMail({
    //         from: `"${this.configService.get('APP_NAME')}" <${this.configService.get(
    //             'MAIL_FROM_ADDRESS',
    //         )}>`,
    //         to: 'ibrahim@exactmanpower.co.tz',
    //         cc: ['halidiselemani94@gmail.com'],
    //         subject: 'New Employer Registered',
    //         html: `
    //     <h2>📣 New Employer Registered</h2>

    //     <p>A new employer has successfully registered on the <strong>eKazi Portal</strong>.</p>

    //     <table cellpadding="6" cellspacing="0" border="0">
    //         <tr>
    //             <td><strong>Name:</strong></td>
    //             <td>${username}</td>
    //         </tr>
    //         <tr>
    //             <td><strong>Email:</strong></td>
    //             <td>${email}</td>
    //         </tr>
    //         <tr>
    //             <td><strong>Registered At:</strong></td>
    //             <td>${new Date().toLocaleString()}</td>
    //         </tr>
    //     </table>

    //     <br>

    //     <p>The employer can verify their email using the link below:</p>

    //     <a href="${verifyLink}"
    //        style="display:inline-block;padding:12px 20px;background:#0d6efd;color:#ffffff;text-decoration:none;border-radius:6px;">
    //         Verify Email
    //     </a>

    //     <br><br>

    //     <p>Regards,<br><strong>eKazi Portal System</strong></p>
    // `,
    //     });
    // }
    async sendVerificationEmail(email: string, username: string) {
        const verificationCode = Math.floor(
            100000 + Math.random() * 900000,
        ).toString();

        const expiresAt = new Date();
        expiresAt.setMinutes(expiresAt.getMinutes() + 10);

        // Format expiry time
        const expiryTime = expiresAt.toLocaleString('en-US', {
            dateStyle: 'medium',
            timeStyle: 'short',
        });

        // Save code to database
        await this.usersRepository.update(
            { email },
            {
                verify_key: verificationCode,
                verified: false,
                verify_key_expires_at: expiresAt,
            },
        );

        await this.mailService.sendMail({
            from: `"${this.configService.get('APP_NAME')}" <${this.configService.get(
                'MAIL_FROM_ADDRESS',
            )}>`,
            to: email,
            subject: 'Verify Your eKazi Account',
            html: `
        <h2>Welcome to eKazi</h2>

        <p>Hello <strong>${username}</strong>,</p>

        <p>Thank you for registering with eKazi.</p>

        <p>Your verification code is:</p>

        <div style="
            font-size:32px;
            font-weight:bold;
            letter-spacing:6px;
            background:#f4f4f4;
            padding:15px;
            text-align:center;
            border-radius:8px;
        ">
            ${verificationCode}
        </div>

        <p>
            This verification code will expire in 
            <strong>10 minutes</strong>.
        </p>

        <p>
            Expiry time:
            <strong>${expiryTime}</strong>
        </p>

        <p>
            Please enter this code before the expiry time to activate your account.
        </p>

        <p>
            If you did not create this account, you can ignore this email.
        </p>

        <br>

        <p><strong>eKazi Team</strong></p>
        `,
        });
    }

    async resendVerificationEmail(email: string) {

        const user = await this.usersRepository.findOne({
            where: { email },
        });

        if (!user) {
            throw new NotFoundException({
                success: false,
                message: 'User not found',
            });
        }


        if (user.verified === true) {
            return {
                success: false,
                message: 'Account already verified',
            };
        }


        const verificationCode = Math.floor(
            100000 + Math.random() * 900000,
        ).toString();


        const expiresAt = new Date();
        expiresAt.setMinutes(
            expiresAt.getMinutes() + 10,
        );


        user.verify_key = verificationCode;
        user.verify_key_expires_at = expiresAt;


        await this.usersRepository.save(user);


        await this.mailService.sendMail({
            from: `"eKazi" <${this.configService.get('MAIL_FROM_ADDRESS')}>`,
            to: email,
            subject: 'New eKazi Verification Code',
            html: `
            <h2>Email Verification</h2>

            <p>Your new verification code is:</p>

            <h1>${verificationCode}</h1>

            <p>
                This code expires at:
                <strong>${expiresAt.toLocaleString()}</strong>
            </p>

            <p>
                If you did not request this code, ignore this email.
            </p>

            <br>
            <strong>eKazi Team</strong>
        `,
        });


        return {
            success: true,
            message: 'New verification code sent successfully',
        };
    }
    async verifyEmail(token: string) {

        const user = await this.usersRepository.findOne({
            where: {
                verify_key: token,
            },
        });

        if (!user) {
            throw new UnauthorizedException({
                success: false,
                message: 'Invalid verification token',
            });
        }


        // Already verified check
        if (user.verified === true) {
            throw new BadRequestException({
                success: false,
                message: 'Account already verified',
            });
        }


        // Check token expiry
        if (
            !user.verify_key_expires_at ||
            new Date() > user.verify_key_expires_at
        ) {
            throw new UnauthorizedException({
                success: false,
                message: 'Verification token has expired. Please request a new one.',
            });
        }


        // Verify account
        // user.verified = true,
        //     user.email_verified_at = new Date();

        // // Clear token after success
        // user.verify_key = null,
        //     user.verify_key_expires_at = null,


        //     await this.usersRepository.save(user);

        // // ==========================
        // // CREATE LOGIN TOKEN
        // // ==========================
        // const plainToken = randomBytes(40).toString('hex');

        // const hashedToken = createHash('sha256')
        //     .update(plainToken)
        //     .digest('hex');

        // const personalToken = this.tokenRepository.create({
        //     tokenable_type: 'Users',
        //     tokenable_id: user.id,
        //     name: 'api-token',
        //     token: hashedToken,
        //     abilities: '["*"]',
        //     expires_at: new Date(
        //         Date.now() + 30 * 24 * 60 * 60 * 1000,
        //     ),
        // });

        // await this.tokenRepository.save(personalToken);

        return {
            success: true,
            message: 'Email verified successfully.',
            // token: plainToken,
            data: user,
        };
    }

    async myaccount(user: Users) {
        try {
            const account = await this.usersRepository.findOne({
                where: {
                    id: user.id,
                },
                relations: [
                    'role',
                    'role.permissions',

                    // User permissions
                    'userPermissions',
                    'userPermissions.permission',

                    // Client staff + position
                    'clientStaff',
                    'clientStaff.position',
                ],
            });

            if (!account) {
                throw new NotFoundException({
                    success: false,
                    message: 'User account not found',
                });
            }

            // ========================================================
            // ROLE PERMISSIONS
            // ========================================================

            const rolePermissions =
                account.role?.permissions?.map(permission => ({
                    id: permission.id,
                    name: permission.name,
                })) || [];

            // ========================================================
            // USER PERMISSIONS
            // ========================================================

            const userPermissions =
                account.userPermissions?.map(userPermission => ({
                    id: userPermission.id,
                    permission_id: userPermission.permission_id,

                    permission: userPermission.permission
                        ? {
                            id: userPermission.permission.id,
                            name: userPermission.permission.name,
                        }
                        : null,
                })) || [];

            // ========================================================
            // CLIENT STAFF
            // ========================================================

            const clientStaff =
                account.clientStaff?.map(staff => ({
                    id: staff.id,

                    client_id: staff.client_id,
                    user_id: staff.user_id,

                    prefix_id: staff.prefix_id,

                    first_name: staff.first_name,
                    middle_name: staff.middle_name,
                    last_name: staff.last_name,

                    phone_number: staff.phone_number,

                    client_staff_position_id:
                        staff.client_staff_position_id,

                    position: staff.position
                        ? {
                            id: staff.position.id,
                            position_name:
                                staff.position.position_name,
                        }
                        : null,

                    created_at: staff.created_at,
                    updated_at: staff.updated_at,
                })) || [];

            // ========================================================
            // RESPONSE
            // ========================================================

            return {
                success: true,
                message: 'Successfully retrieved user account',

                data: {
                    id: account.id,
                    username: account.username,
                    email: account.email,
                    verified: account.verified,

                    role_id: account.role_id,

                    role: account.role
                        ? {
                            id: account.role.id,
                            name: account.role.name,
                        }
                        : null,

                    role_permissions: rolePermissions,

                    user_permissions: userPermissions,

                    client_staff: clientStaff,
                },
            };

        } catch (error) {

            if (error instanceof HttpException) {
                throw error;
            }

            throw new InternalServerErrorException({
                success: false,
                message: 'Failed to fetch employer account',
                error: error.message,
            });
        }
    }

    /**
 * Get users with verification statistics
 */
    async getUsersWithStatistics(
        page: number = 1,
        limit: number = 20,
        search: string = '',
        verified?: boolean,
    ) {
        /*
        |--------------------------------------------------------------------------
        | Pagination
        |--------------------------------------------------------------------------
        */

        page = Math.max(1, Number(page) || 1);
        limit = Math.max(1, Number(limit) || 20);

        const skip = (page - 1) * limit;


        /*
        |--------------------------------------------------------------------------
        | Base Query
        |--------------------------------------------------------------------------
        */

        const query = this.usersRepository
            .createQueryBuilder('user');




        /*
        |--------------------------------------------------------------------------
        | Search
        |--------------------------------------------------------------------------
        */

        if (search.trim()) {
            query.andWhere(
                `(
                user.username LIKE :search
                OR user.email LIKE :search
                OR user.temp_email LIKE :search
            )`,
                {
                    search: `%${search.trim()}%`,
                },
            );
        }


        /*
        |--------------------------------------------------------------------------
        | Verified Filter
        |--------------------------------------------------------------------------
        */

        if (verified !== undefined) {
            query.andWhere(
                'user.verified = :verified',
                {
                    verified: verified ? 1 : 0,
                },
            );
        }


        /*
        |--------------------------------------------------------------------------
        | Get Users
        |--------------------------------------------------------------------------
        */

        query
            .orderBy(
                'user.created_at',
                'DESC',
            )
            .skip(skip)
            .take(limit);

        const [
            users,
            total,
        ] = await query.getManyAndCount();


        /*
        |--------------------------------------------------------------------------
        | Statistics
        |--------------------------------------------------------------------------
        */

        const statisticsQuery =
            this.usersRepository
                .createQueryBuilder('user');




        const statistics =
            await statisticsQuery
                .select([
                    'COUNT(user.id) AS total_users',

                    `
                SUM(
                    CASE
                        WHEN user.verified = 1
                        THEN 1
                        ELSE 0
                    END
                ) AS verified_users
                `,

                    `
                SUM(
                    CASE
                        WHEN user.verified = 0
                        THEN 1
                        ELSE 0
                    END
                ) AS unverified_users
                `,

                    `
                SUM(
                    CASE
                        WHEN user.hide = 0
                        THEN 1
                        ELSE 0
                    END
                ) AS active_users
                `,

                    `
                SUM(
                    CASE
                        WHEN user.hide = 1
                        THEN 1
                        ELSE 0
                    END
                ) AS hidden_users
                `,
                ])
                .getRawOne();


        /*
        |--------------------------------------------------------------------------
        | Convert Statistics
        |--------------------------------------------------------------------------
        */

        const totalUsers =
            Number(
                statistics?.total_users ?? 0,
            );

        const verifiedUsers =
            Number(
                statistics?.verified_users ?? 0,
            );

        const unverifiedUsers =
            Number(
                statistics?.unverified_users ?? 0,
            );

        const activeUsers =
            Number(
                statistics?.active_users ?? 0,
            );

        const hiddenUsers =
            Number(
                statistics?.hidden_users ?? 0,
            );


        const verificationPercentage =
            totalUsers > 0
                ? (
                    verifiedUsers /
                    totalUsers
                ) * 100
                : 0;


        /*
        |--------------------------------------------------------------------------
        | Format Users
        |--------------------------------------------------------------------------
        */

        const data = users.map(
            (user) => ({
                id: user.id,

                client_id:
                    user.client_id,

                username:
                    user.username,

                email:
                    user.email,

                role_id:
                    user.role_id,

                hide:
                    user.hide,

                verified:
                    user.verified,

                email_verified_at:
                    user.email_verified_at,

                created_at:
                    user.created_at,

                updated_at:
                    user.updated_at,

                last_activity_at:
                    user.last_activity_at,
            }),
        );


        /*
        |--------------------------------------------------------------------------
        | Response
        |--------------------------------------------------------------------------
        */

        return {
            success: true,

            message:
                'Users and verification statistics retrieved successfully',

            statistics: {
                total_users:
                    totalUsers,

                verified_users:
                    verifiedUsers,

                unverified_users:
                    unverifiedUsers,

                active_users:
                    activeUsers,

                hidden_users:
                    hiddenUsers,

                verification_percentage:
                    Number(
                        verificationPercentage.toFixed(2),
                    ),
            },

            data,

            pagination: {
                page,

                limit,

                total,

                total_pages:
                    Math.ceil(
                        total / limit,
                    ),
            },
        };
    }


    async registerApplicant(dto: RegisterApplicantDto) {
        // 1. Validate password confirmation.
        if (dto.password !== dto.password_confirmation) {
            throw new BadRequestException(
                'Password confirmation does not match',
            );
        }

        const email = dto.email.trim().toLowerCase();

        try {
            const result = await this.dataSource.transaction(
                async (manager) => {
                    // 2. Initialize correctly typed repositories.
                    const usersRepo: Repository<Users> =
                        manager.getRepository(Users);

                    const applicantsRepo: Repository<Applicants> =
                        manager.getRepository(Applicants);

                    const phonesRepo: Repository<ApplicantPhones> =
                        manager.getRepository(ApplicantPhones);

                    const addressesRepo: Repository<ApplicantAddresses> =
                        manager.getRepository(ApplicantAddresses);

                    const notificationsRepo: Repository<Notification> =
                        manager.getRepository(Notification);

                    // 3. Check whether the email already exists.
                    const existingUser = await usersRepo.findOne({
                        where: { email },
                    });

                    if (existingUser) {
                        throw new ConflictException(
                            'User already registered',
                        );
                    }

                    // 4. Create user account.
                    // Confirm role_id 12 against your roles table.
                    const user: Users = usersRepo.create({
                        role_id: 12,
                        email,
                        temp_email: email,
                        hide: 0,
                        password: await bcrypt.hash(dto.password, 10),
                        verify_key: randomBytes(32).toString('hex'),
                    } as any) as unknown as Users;

                    const savedUser: Users = await usersRepo.save(user);

                    // 5. Format applicant names.
                    const capitalizeName = (value: string): string => {
                        return value
                            .trim()
                            .toLowerCase()
                            .replace(
                                /\b\p{L}/gu,
                                (letter) => letter.toUpperCase(),
                            );
                    };

                    // 6. Create applicant profile.
                    const applicant: Applicants = applicantsRepo.create({
                        first_name: capitalizeName(dto.firstname),
                        middle_name: dto.middlename
                            ? capitalizeName(dto.middlename)
                            : null,
                        last_name: capitalizeName(dto.lastname),
                        marital_id: dto.marital_status_id,
                        gender_id: dto.gender_id,
                        dob: dto.dob,
                        user_id: savedUser.id,
                    } as any) as unknown as Applicants;

                    const savedApplicant: Applicants =
                        await applicantsRepo.save(applicant);

                    // 7. Save applicant phone.
                    const phone = phonesRepo.create({
                        phone_number: dto.phone,
                        applicant_id: savedApplicant.id,
                    } as any);

                    await phonesRepo.save(phone);

                    // 8. Save applicant address.
                    const address = addressesRepo.create({
                        sub_location: dto.address,
                        applicant_id: savedApplicant.id,
                        region_id: dto.region_id,
                    } as any);

                    await addressesRepo.save(address);

                    // 9. Create registration notification.
                    const notification = notificationsRepo.create({
                        applicant_id: savedApplicant.id,
                        data: 'New Applicant Joined',
                        type: 'new-applicant',
                    } as any);

                    await notificationsRepo.save(notification);

                    // 10. Return the data needed after the transaction.
                    return {
                        userId: savedUser.id,
                        applicantId: savedApplicant.id,
                        email: savedUser.email,
                        verifyKey: savedUser.verify_key,
                    };
                },
            );

            // Send verification email only after the transaction commits.
            const applicantName = [
                dto.firstname,
                dto.middlename,
                dto.lastname,
            ]
                .filter((name) => name?.trim())
                .join(' ');

            let verificationEmailSent = false;

            try {
                if (!result.email) {
                    throw new InternalServerErrorException(
                        'Applicant registered, but email address is missing',
                    );
                }

                await this.sendVerificationEmail(
                    result.email,
                    applicantName,
                );

                verificationEmailSent = true;
                console.log(
                    `Verification email sent to ${result.email}`,
                );
            } catch (emailError) {
                console.error(
                    'Failed to send applicant verification email:',
                    emailError,
                );
            }

            return {
                success: true,
                message: verificationEmailSent
                    ? 'Account created successfully. Check your email for the verification code.'
                    : 'Account created successfully, but the verification email could not be sent. Please request a new code.',
                user_id: result.userId,
                applicant_id: result.applicantId,
                email: result.email,
                verification_email_sent: verificationEmailSent,
            };
        } catch (error: any) {
            // Preserve expected HTTP errors.
            if (
                error instanceof ConflictException ||
                error instanceof BadRequestException
            ) {
                throw error;
            }

            // Handle duplicate-key errors, including concurrent registrations.
            if (
                error?.code === 'ER_DUP_ENTRY' ||
                error?.errno === 1062
            ) {
                throw new ConflictException(
                    'User already registered',
                );
            }

            // Log the underlying error for server-side debugging.
            console.error('Applicant registration failed:', error);

            throw new InternalServerErrorException(
                'Failed to register applicant',
            );
        }
    }

}