import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Clients } from 'src/client/clients.entity';
import { AdminCompanyController } from './admin-clients.controller';
import { AdminClientsService } from './admin-clients.service';
import { Users } from 'src/entities/users.entity';
import { ClientAddress } from 'src/client/entities/client-address.entity';
import { ClientEmail } from 'src/client/entities/client-email.entity';
import { ApplicantApplication } from 'src/entities/applicants/applicant-applicantions.entity';
import { Jobs } from 'src/jobs/entities/job.entity';
import { ClientPhone } from 'src/client/entities/client-phones.entity';
import { ClientDescription } from 'src/client/entities/client-descriptions.entity';
import { JobStage } from 'src/jobs/entities/job-stage.entity';
import { PersonalAccessToken } from 'src/entities/personal-access-token.entity';

@Module({
        imports: [
        TypeOrmModule.forFeature([
            Clients,
            Users,
            ClientAddress,
            ClientEmail,
            ApplicantApplication,
            Jobs,
            ClientPhone,
            ClientDescription,
            JobStage,
            PersonalAccessToken,
        ]),
    ],

    controllers: [
        AdminCompanyController,
    ],

    providers: [
        AdminClientsService,
    ],

    exports: [
        AdminClientsService,
    ],
})
export class AdminClientsModule {}
