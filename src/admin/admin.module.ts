 import {
    Module,
} from '@nestjs/common';

import {
    TypeOrmModule,
} from '@nestjs/typeorm';

import { AdminController } from './admin.controller';

import { AdminService } from './admin.service';
import { Clients } from 'src/client/clients.entity';
import { Notification } from 'src/client/entities/notifications.entity';
import { Jobs } from 'src/jobs/entities/job.entity';
import { Applicants } from 'src/entities/applicants/applicants.entity';
import { Users } from 'src/entities/users.entity';
import { PersonalAccessToken } from 'src/entities/personal-access-token.entity';
import { JobStage } from 'src/jobs/entities/job-stage.entity';

@Module({

    imports: [

        TypeOrmModule.forFeature([
            Users,
            Applicants,
            Jobs,
            Notification,
            Clients,
            PersonalAccessToken,
            JobStage,

        ]),

    ],

    controllers: [

        AdminController,

    ],

    providers: [

        AdminService,

    ],

    exports: [

        AdminService,

    ],

})
export class AdminModule {}