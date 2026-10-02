  import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Evaluation } from 'src/entities/evaluation.entity';
import { EvaluationCriteria } from 'src/entities/evaluation-criteria.entity';

import { EvaluationCriteriaController } from './evaluation-criteria.controller';
import { EvaluationCriteriaService } from './evaluation-criteria.service';
import { Users } from 'src/entities/users.entity';
import { PersonalAccessToken } from 'src/entities/personal-access-token.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            Evaluation,
            EvaluationCriteria,
            Users,
            PersonalAccessToken,
        ]),
    ],

    controllers: [
        EvaluationCriteriaController,
    ],

    providers: [
        EvaluationCriteriaService,
    ],

    exports: [
        EvaluationCriteriaService,
    ],
})
export class EvaluationCriteriaModule {}