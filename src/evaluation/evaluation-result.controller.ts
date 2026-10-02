import {
    BadRequestException,
    Body,
    Controller,
    Get,
    Param,
    ParseIntPipe,
    Post,
    Query,
    UseGuards,
} from '@nestjs/common';

import { EvaluationResultService } from './evaluation-result.service';

import { SaveEvaluationResultDto } from './dto/save-evaluation-result.dto';

import { SanctumGuard } from '../auth/guards/sanctum.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Users } from '../entities/users.entity';

@Controller('client-evaluation')
@UseGuards(SanctumGuard)
export class EvaluationResultController {
    constructor(
        private readonly evaluationResultService:
            EvaluationResultService,
    ) { }

    @Post()
    async store(
        @CurrentUser() user: Users,
        @Body() dto: SaveEvaluationResultDto,
    ) {
        return this.evaluationResultService.store(
            user.id,
            dto,
        );
    }
    @Get('interview-form')
    @UseGuards(SanctumGuard)
    async getInterviewForm(
        @CurrentUser() user: Users,

        @Query('applicant_id')
        applicantId: number,

        @Query('job_id')
        jobId: number,

        @Query('round_id')
        roundId: number,
    ) {
        if (!applicantId) {
            throw new BadRequestException(
                'applicant_id is required',
            );
        }

        if (!jobId) {
            throw new BadRequestException(
                'job_id is required',
            );
        }

        if (!roundId) {
            throw new BadRequestException(
                'round_id is required',
            );
        }

        if (!user.client_id) {
            throw new BadRequestException(
                'User is not associated with a client',
            );
        }

        return this.evaluationResultService.getInterviewForm(
            user.id,
            Number(applicantId),
            Number(jobId),
            Number(roundId),
        );
    }
}