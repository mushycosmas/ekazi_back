import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { SanctumGuard } from './guards/sanctum.guard';
import { RolesGuard } from './guards/roles.guard';

import { Users } from 'src/entities/users.entity';
import { PersonalAccessToken } from 'src/entities/personal-access-token.entity';
import { PasswordReset } from 'src/entities/password-resets.entity';

import { MailModule } from 'src/mail/mail.module';
import { EmailVerification } from 'src/entities/email-verification.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Users,
      PersonalAccessToken,
      PasswordReset,
      EmailVerification
    ]),
    MailModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    SanctumGuard,
    RolesGuard,
  ],
  exports: [
    AuthService,
    SanctumGuard,
  ],
})
export class AuthModule {}