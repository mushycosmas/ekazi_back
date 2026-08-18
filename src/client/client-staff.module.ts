import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientStaff } from './entities/client-staff.entity';
import { ClientStaffController } from './client-staff.controller';
import { ClientStaffService } from './client-staff.service';
import { Users } from 'src/entities/users.entity';
import { PersonalAccessToken } from 'src/entities/personal-access-token.entity';
import { Clients } from './clients.entity';
import { MailService } from 'src/mail/mail.service';
import { MailModule } from 'src/mail/mail.module';

@Module({
      imports: [

        TypeOrmModule.forFeature([

            ClientStaff,
            Users,
            PersonalAccessToken,
            Clients,
           

        ]),
        MailModule,
         

    ],

    controllers: [

        ClientStaffController,

    ],

    providers: [

        ClientStaffService,

    ],

    exports: [

        ClientStaffService,

    ],
})
export class ClientStaffModule {}
