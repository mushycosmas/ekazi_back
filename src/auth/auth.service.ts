import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomBytes, createHash } from 'crypto';
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

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(Users)
        private readonly usersRepository: Repository<Users>,

        @InjectRepository(PersonalAccessToken)
        private readonly tokenRepository: Repository<PersonalAccessToken>,

        @InjectRepository(PasswordReset)
        private readonly passwordResetRepository: Repository<PasswordReset>,

        @InjectRepository(EmailVerification)
        private emailVerificationRepository: Repository<EmailVerification>,

        private readonly mailService: MailService,
        private configService: ConfigService, // ✅ ADD THIS
    ) { }

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
            user,
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


    async sendVerificationEmail(email: string) {
        const token = randomBytes(32).toString('hex');

        await this.emailVerificationRepository.delete({ email });

        await this.emailVerificationRepository.save({
            email,
            token: createHash('sha256').update(token).digest('hex'),
        });

        const verifyLink = `${this.configService.get(
            'FRONTEND_URL',
        )}/verify-email?token=${token}&email=${email}`;

        await this.mailService.sendMail({
            from: `"${this.configService.get('APP_NAME')}" <${this.configService.get(
                'MAIL_FROM_ADDRESS',
            )}>`,
            to: email,
            subject: 'Verify Your Account',
            html: `
      <h2>Account Verification</h2>
      <p>Click below to verify your account:</p>
      <a href="${verifyLink}">Verify Email</a>
    `,
        });
    }
    async verifyEmail(email: string, token: string) {
        const record = await this.emailVerificationRepository.findOne({
            where: { email },
        });

        if (!record) {
            throw new UnauthorizedException('Invalid verification request');
        }

        const hashedToken = createHash('sha256').update(token).digest('hex');

        if (hashedToken !== record.token) {
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

        await this.emailVerificationRepository.delete({ email });

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