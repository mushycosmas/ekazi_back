import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Jobs } from '../entities/job.entity';
import { JobEmails } from '../entities/job-emails.entity';
import { JobExternalUrls } from '../entities/job-external-urls.entity';
import { JobApplicationModals } from '../entities/job-application-modals.entity';

import { JobSettingsService } from '../services/job-settings.service';
import { JobSettingsController } from '../controllers/job-settings.controller';
import { Users } from 'src/entities/users.entity';
import { PersonalAccessToken } from 'src/entities/personal-access-token.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            Jobs,
            JobEmails,
            JobExternalUrls,
            JobApplicationModals,
            Users,
            PersonalAccessToken,
        ]),
    ],
    controllers: [JobSettingsController],
    providers: [JobSettingsService],
    exports: [JobSettingsService],
})
export class JobSettingsModule { }