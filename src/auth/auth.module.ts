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
import { Clients } from 'src/client/clients.entity';
import { ClientEmail } from 'src/client/entities/client-email.entity';
import { ClientPhone } from 'src/client/entities/client-phones.entity';
import { Notification } from 'src/client/entities/notifications.entity';
import { Role } from 'src/entities/role.entity';
import { MailService } from 'src/mail/mail.service';
import { Applicants } from 'src/entities/applicants/applicants.entity';
import { ApplicantPhones } from 'src/entities/applicants/applicant-phones.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Users,
      PersonalAccessToken,
      PasswordReset,
      EmailVerification,
      Clients,
      ClientEmail,
      Notification,
      ClientPhone,
      Role,
      Applicants,
      ApplicantPhones,
      
 

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