 import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Entities
import { Users } from 'src/entities/users.entity';
import { PersonalAccessToken } from 'src/entities/personal-access-token.entity';

import { Evaluation } from 'src/entities/evaluation.entity';
import { EvaluationForm } from 'src/entities/evaluation-form.entity';
import { EvaluationCriteria } from 'src/entities/evaluation-criteria.entity';
import { EvaluationRemark } from 'src/entities/evaluation-remark.entity';
import { Remark } from 'src/entities/remark.entity';
import { EvaluationSummary } from 'src/entities/evaluation-summary.entity';
import { Benefit } from 'src/entities/benefit.entity';

import { InterviewAction } from 'src/jobs/entities/interview/interview-action.entity';

// Services
import { EvaluationSummaryService } from './evaluation-summary.service';
import { EvaluationResultService } from './evaluation-result.service';
import { EvaluationService } from './evaluation.service';

// Controllers
import { EvaluationSummaryController } from './evaluation-summary.controller';
import { EvaluationResultController } from './evaluation-result.controller';
import { RemarkController } from './remark.controller';
import { RemarkService } from './remark.service';
import { EvaluationCriteriaService } from './evaluation-criteria.service';
import { EvaluationCriteriaController } from './evaluation-criteria.controller';
import { EvaluationCriteriaModule } from './evaluation-criteria.module';
import { EvaluationResult } from 'src/entities/evaluation-result.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            Users,
            PersonalAccessToken,

            // Evaluation
            Evaluation,
            EvaluationForm,
            EvaluationCriteria,
            EvaluationRemark,
            Remark,
            EvaluationResult,
            // Summary
            EvaluationSummary,

            // Benefits
            Benefit,

            // Interview
            InterviewAction,
        ]),
        EvaluationCriteriaModule,
    ],

    controllers: [
        EvaluationSummaryController,
        EvaluationResultController,
        RemarkController,
        EvaluationCriteriaController,
    ],

    providers: [
        EvaluationSummaryService,
        EvaluationResultService,
        EvaluationService,
        RemarkService,
        EvaluationCriteriaService,
    ],

    exports: [
        EvaluationSummaryService,
        EvaluationResultService,
        EvaluationService,
        RemarkService,
    ],
})
export class EvaluationSummaryModule {}