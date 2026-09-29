 import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Benefit } from '../entities/benefit.entity';

import { BenefitController } from './benefit.controller';
import { BenefitService } from './benefit.service';
import { Users } from 'src/entities/users.entity';
import { PersonalAccessToken } from 'src/entities/personal-access-token.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            Benefit,
            Users,
            PersonalAccessToken,
        ]),
    ],

    controllers: [
        BenefitController,
    ],

    providers: [
        BenefitService,
    ],

    exports: [
        BenefitService,
    ],
})
export class BenefitModule {}