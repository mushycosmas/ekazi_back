 import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';


import { TermConditionType } from 'src/entities/term-condition-type.entity';
import { TermConditionTypesController } from './term-condition-types.controller';
import { TermConditionTypesService } from './term-condition-types.service';
import { Users } from 'src/entities/users.entity';
import { PersonalAccessToken } from 'src/entities/personal-access-token.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            TermConditionType,
            Users,
            PersonalAccessToken,
        ]),
    ],
    controllers: [
        TermConditionTypesController,
    ],
    providers: [
        TermConditionTypesService,
    ],
    exports: [
        TermConditionTypesService,
    ],
})
export class TermConditionTypesModule {}