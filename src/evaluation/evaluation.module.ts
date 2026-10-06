import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EvaluationCriteria } from 'src/entities/evaluation-criteria.entity';
import { EvaluationForm } from 'src/entities/evaluation-form.entity';
import { EvaluationRemark } from 'src/entities/evaluation-remark.entity';
import { Evaluation } from 'src/entities/evaluation.entity';
import { PersonalAccessToken } from 'src/entities/personal-access-token.entity';
import { Remark } from 'src/entities/remark.entity';
import { Users } from 'src/entities/users.entity';
import { EvaluationService } from './evaluation.service';
import { EvaluationController } from './evaluation.controller';
import { EvaluationSummaryService } from './evaluation-summary.service';
import { EvaluationSummaryController } from './evaluation-summary.controller';
import { EvaluationSummaryModule } from './evaluation-summary.module';
import { EvaluationSummary } from 'src/entities/evaluation-summary.entity';
import { EvaluationResultController } from './evaluation-result.controller';
import { EvaluationResultService } from './evaluation-result.service';
import { Benefit } from 'src/entities/benefit.entity';
import { InterviewAction } from 'src/jobs/entities/interview/interview-action.entity';
import { EvaluationResult } from 'src/entities/evaluation-result.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            Users,
            PersonalAccessToken,
            EvaluationForm,
            Evaluation,
            EvaluationCriteria,
            EvaluationRemark,
            Remark,
            EvaluationSummary,
            Benefit,
            InterviewAction,
            EvaluationResult,
        ]),
        EvaluationSummaryModule,

    ],
    controllers: [
        EvaluationController,
        EvaluationSummaryController,
        EvaluationResultController,
    ],

    providers: [
        EvaluationService,
        EvaluationSummaryService, // ✅ must be here
        EvaluationResultService,
    ],
    exports: [
        EvaluationService,
        TypeOrmModule,
        EvaluationResultService,
    ],
})
export class EvaluationModule { }