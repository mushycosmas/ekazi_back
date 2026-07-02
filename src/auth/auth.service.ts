import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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

        @InjectRepository(EmailVerification)
        private emailVerificationRepository: Repository<EmailVerification>,

        private readonly mailService: MailService,
        private configService: ConfigService, // ✅ ADD THIS
    ) { }


    async registerEmployer(dto: CreateEmployerDto) {
        const existing = await this.usersRepository.findOne({
            where: { email: dto.email },
        });

        if (existing) {
            throw new BadRequestException('Email already exists');
        }

        const role = await this.roleRepository.findOne({
            where: { name: 'Post Jobs Only' },
        });

        if (!role) {
            throw new BadRequestException('Role not found');
        }

        const hashedPassword = await bcrypt.hash(dto.password, 10);

        // =========================
        // USER
        // =========================
        const now = new Date();

        const user = this.usersRepository.create({
            username: dto.name,
            email: dto.email,
            temp_email: dto.email,
            password: hashedPassword,
            role_id: role.id,
            hide: false,
            verify_key: dto.email + new Date().toISOString().slice(0, 10),
            created_at: now,
            updated_at: now,
        });

        await this.usersRepository.save(user);

        // =========================
        // CLIENT
        // =========================
        const client = this.clientRepo.create({
            creator_id: user.id,
            updator_id: user.id,
            type_id: dto.type,
            client_name: dto.name,
        });

        await this.clientRepo.save(client);

        // link user
        user.client_id = client.id;
        await this.usersRepository.save(user);

        // =========================
        // ROLE ASSIGN (Spatie equivalent)
        // =========================
        // If using nestjs CASL or custom roles:
        // user.role = role;

        // =========================
        // CLIENT EMAIL
        // =========================
        await this.clientEmailRepo.save({
            client_email: dto.email,
            client_id: client.id,
        });

        // =========================
        // CLIENT PHONE
        // =========================
        await this.clientPhoneRepo.save({
            phone_number: dto.phone,
            client_id: client.id,
        });

        // =========================
        // NOTIFICATION
        // =========================
        await this.notificationRepo.save({
            client_id: client.id,
            data: 'New Client Joined',
            type: 'new-client',
        });
        if (!user.email) {
            throw new BadRequestException('User email is missing');
        }
        if (!user.username) {
            throw new BadRequestException('User email is missing');
        }
        // ✅ SEND EMAIL VERIFICATION AFTER SUCCESS
        await this.sendVerificationEmail(
            user.email,
            user.username,
        );

        return {
            success: true,
            message: 'Employer account created successfully',
            data: {
                id: user.id,
                email: user.email,
                client_id: client.id,
            },
        };
    }

    async login(username: string, password: string) {
        const user = await this.usersRepository.findOne({
            where: { email: username },
            relations: ['role'],
        });

        if (!user) {
            throw new UnauthorizedException('Invalid credentials not user');
        }
        if (!user.password) {
            throw new UnauthorizedException('Invalid credentials not have password');
        }
        const valid = await bcrypt.compare(password, user.password);
        console.log('password', user.password);

        if (!valid) {
            throw new UnauthorizedException('Invalid credentials');
        }

        // Generate plain token
        const plainToken = randomBytes(40).toString('hex');

        // Hash token before storing (Laravel Sanctum style)
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
            token: plainToken, // return only the plain token
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
        const user = await this.usersRepository.findOne({
            where: { email },
        });

        if (!user) {
            return {
                success: true,
                message: 'If the email exists, a reset link has been sent.',
            };
        }

        const token = randomBytes(32).toString('hex');

        await this.passwordResetRepository.delete({ email });

        await this.passwordResetRepository.save({
            email,
            token,
            expires_at: new Date(Date.now() + 15 * 60 * 1000),
        });

        await this.mailService.sendPasswordReset(email, token);

        return {
            success: true,
            message: 'Password reset link sent.',
        };
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
    async sendVerificationEmail(email: string, username: string) {
        const secret = this.configService.get('APP_KEY');

        const token = randomBytes(32).toString('hex');

        const signature = createHmac('sha256', secret)
            .update(token + email)
            .digest('hex');

        const fullToken = `${token}.${signature}`;

        const verifyLink = `${this.configService.get(
            'FRONTEND_URL',
        )}/verify-email?token=${fullToken}&email=${email}`;

        await this.mailService.sendMail({
            from: `"${this.configService.get('APP_NAME')}" <${this.configService.get(
                'MAIL_FROM_ADDRESS',
            )}>`,
            to: 'ibrahim@exactmanpower.co.tz',
            cc: ['halidiselemani94@gmail.com'],
            subject: 'New Employer Registered',
            html: `
        <h2>📣 New Employer Registered</h2>

        <p>A new employer has successfully registered on the <strong>eKazi Portal</strong>.</p>

        <table cellpadding="6" cellspacing="0" border="0">
            <tr>
                <td><strong>Name:</strong></td>
                <td>${username}</td>
            </tr>
            <tr>
                <td><strong>Email:</strong></td>
                <td>${email}</td>
            </tr>
            <tr>
                <td><strong>Registered At:</strong></td>
                <td>${new Date().toLocaleString()}</td>
            </tr>
        </table>

        <br>

        <p>The employer can verify their email using the link below:</p>

        <a href="${verifyLink}"
           style="display:inline-block;padding:12px 20px;background:#0d6efd;color:#ffffff;text-decoration:none;border-radius:6px;">
            Verify Email
        </a>

        <br><br>

        <p>Regards,<br><strong>eKazi Portal System</strong></p>
    `,
        });
    }
    async verifyEmail(email: string, token: string) {
        const secret = this.configService.get<string>('APP_KEY');

        if (!secret) {
            throw new InternalServerErrorException('APP_KEY is not set');
        }

        const parts = token.split('.');

        if (parts.length !== 2) {
            throw new UnauthorizedException('Invalid verification token');
        }

        const [rawToken, signature] = parts;

        const expectedSignature = createHmac('sha256', secret)
            .update(rawToken + email)
            .digest('hex');

        if (expectedSignature !== signature) {
            throw new UnauthorizedException('Invalid verification token');
        }

        const user = await this.usersRepository.findOne({
            where: { email },
        });

        if (!user) {
            throw new UnauthorizedException('User not found');
        }

        user.verified = true;
        await this.usersRepository.save(user);

        return {
            success: true,
            message: 'Email verified successfully',
        };
    }
    async myaccount(user: Users) {
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