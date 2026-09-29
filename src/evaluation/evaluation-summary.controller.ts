 import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    ParseIntPipe,
    Patch,
    Post,
    Query,
    UseGuards,
} from '@nestjs/common';

import { EvaluationSummaryService } from './evaluation-summary.service';

import { CreateEvaluationSummaryDto } from './dto/create-evaluation-summary.dto';
import { UpdateEvaluationSummaryDto } from './dto/update-evaluation-summary.dto';

import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { SanctumGuard } from 'src/auth/guards/sanctum.guard';

import { Users } from '../entities/users.entity';

@Controller('evaluation-summaries')
@UseGuards(SanctumGuard)
export class EvaluationSummaryController {

    constructor(
        private readonly evaluationSummaryService:
            EvaluationSummaryService,
    ) {}

    /**
     * GET /api/employer/evaluation-summaries
     */
    @Get()
    async index(
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 20,
        @Query('search') search: string = '',
    ) {
        return this.evaluationSummaryService.index(
            Number(page),
            Number(limit),
            search,
        );
    }

    /**
     * GET /api/employer/evaluation-summaries/:id
     */
    @Get(':id')
    async show(
        @Param('id', ParseIntPipe) id: number,
    ) {
        return this.evaluationSummaryService.show(id);
    }

    /**
     * POST /api/employer/evaluation-summaries
     */
    @Post()
    async store(
        @CurrentUser() user: Users,
        @Body() dto: CreateEvaluationSummaryDto,
    ) {
        return this.evaluationSummaryService.store(
            user.id,
            dto,
        );
    }

    /**
     * PATCH /api/employer/evaluation-summaries/:id
     */
    @Patch(':id')
    async update(
        @CurrentUser() user: Users,
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateEvaluationSummaryDto,
    ) {
        return this.evaluationSummaryService.update(
            id,
            user.id,
            dto,
        );
    }

    /**
     * DELETE /api/employer/evaluation-summaries/:id
     */
    @Delete(':id')
    async destroy(
        @Param('id', ParseIntPipe) id: number,
    ) {
        return this.evaluationSummaryService.destroy(id);
    }
}