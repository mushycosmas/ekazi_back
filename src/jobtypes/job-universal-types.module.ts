import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { JobUniversalTypes } from '../entities/job-universal-types.entity';

import { JobUniversalTypesController } from './job-universal-types.controller';
import { JobUniversalTypesService } from './job-universal-types.service';
import { Users } from 'src/entities/users.entity';
import { PersonalAccessToken } from 'src/entities/personal-access-token.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            JobUniversalTypes,
            Users,
            PersonalAccessToken, // 👈 THIS FIXES YOUR ERROR
        ]),
    ],
    controllers: [
        JobUniversalTypesController,
    ],
    providers: [
        JobUniversalTypesService,
    ],
    exports: [
        JobUniversalTypesService,
    ],
})
export class JobUniversalTypesModule { }