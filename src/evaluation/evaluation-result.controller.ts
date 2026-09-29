 import {
    Body,
    Controller,
    Get,
    Param,
    ParseIntPipe,
    Post,
    UseGuards,
} from '@nestjs/common';

import { EvaluationResultService } from './evaluation-result.service';

import { SaveEvaluationResultDto } from './dto/save-evaluation-result.dto';

import { SanctumGuard } from '../auth/guards/sanctum.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Users } from '../entities/users.entity';

@Controller('evaluation-results')
@UseGuards(SanctumGuard)
export class EvaluationResultController {
    constructor(
        private readonly evaluationResultService:
            EvaluationResultService,
    ) {}

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
}