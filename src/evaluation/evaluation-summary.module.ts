 import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { EvaluationSummary } from '../entities/evaluation-summary.entity';

import { EvaluationSummaryService } from './evaluation-summary.service';
import { EvaluationSummaryController } from './evaluation-summary.controller';
import { Users } from 'src/entities/users.entity';
import { PersonalAccessToken } from 'src/entities/personal-access-token.entity';
import { RemarkController } from './remark.controller';
import { EvaluationResultService } from './evaluation-result.service';
import { EvaluationResultController } from './evaluation-result.controller';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            Users,
            PersonalAccessToken,
            EvaluationSummary,
        ]),
    
    ],

    controllers: [
        EvaluationSummaryController,
        EvaluationResultController,

    ],

    providers: [
        EvaluationSummaryService,
        EvaluationResultService,
    
    ],

    exports: [
        EvaluationSummaryService,
    ],
})
export class EvaluationSummaryModule {}