 import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

 
import { TermCondition } from 'src/entities/term-condition.entity';
import { TermConditionType } from 'src/entities/term-condition-type.entity';
import { TermConditionService } from './term-condition.service';
import { TermConditionController } from './term-condition.controller';
import { Users } from 'src/entities/users.entity';
import { PersonalAccessToken } from 'src/entities/personal-access-token.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            TermCondition,
            TermConditionType,
            Users,
            PersonalAccessToken,
        ]),
    ],

    controllers: [
        TermConditionController,
    ],

    providers: [
        TermConditionService,
    ],

    exports: [
        TermConditionService,
    ],
})
export class TermConditionModule {}