 import {
    BadRequestException,
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    Query,
    UseGuards,
} from '@nestjs/common';

import { EvaluationCriteriaService } from './evaluation-criteria.service';

import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { SanctumGuard } from 'src/auth/guards/sanctum.guard';
import { Users } from 'src/entities/users.entity';

import { CreateEvaluationCriteriaDto } from './dto/create-evaluation-criteria.dto';
import { UpdateEvaluationCriteriaDto } from './dto/update-evaluation-criteria.dto';

@Controller('evaluation-criterias')
@UseGuards(SanctumGuard)
export class EvaluationCriteriaController {

    constructor(
        private readonly criteriaService:
            EvaluationCriteriaService,
    ) {}


    /**
     * GET /api/evaluation-criteria
     */
    @Get()
    async index(
        @CurrentUser() user: Users,
        @Query('evaluation_id') evaluationId?: string,
        @Query('page') page: string = '1',
        @Query('limit') limit: string = '20',
        @Query('search') search: string = '',
    ) {

        if (user.client_id === null) {
            throw new BadRequestException(
                'User is not associated with a client',
            );
        }

        return this.criteriaService.index(
            user.client_id,
            evaluationId
                ? Number(evaluationId)
                : undefined,
            Number(page),
            Number(limit),
            search,
        );
    }


    /**
     * POST /api/evaluation-criteria
     */
    @Post()
    async create(
        @CurrentUser() user: Users,
        @Body() dto: CreateEvaluationCriteriaDto,
    ) {

        if (user.client_id === null) {
            throw new BadRequestException(
                'User is not associated with a client',
            );
        }

        return this.criteriaService.create(
            user.client_id,
            user.id,
            dto,
        );
    }


    /**
     * GET /api/evaluation-criteria/:id
     */
    @Get(':id')
    async show(
        @CurrentUser() user: Users,
        @Param('id') id: string,
    ) {

        if (user.client_id === null) {
            throw new BadRequestException(
                'User is not associated with a client',
            );
        }

        return this.criteriaService.show(
            user.client_id,
            Number(id),
        );
    }


    /**
     * PATCH /api/evaluation-criteria/:id
     */
    @Patch(':id')
    async update(
        @CurrentUser() user: Users,
        @Param('id') id: string,
        @Body() dto: UpdateEvaluationCriteriaDto,
    ) {

        if (user.client_id === null) {
            throw new BadRequestException(
                'User is not associated with a client',
            );
        }

        return this.criteriaService.update(
            user.client_id,
            user.id,
            Number(id),
            dto,
        );
    }


    /**
     * DELETE /api/evaluation-criteria/:id
     */
    @Delete(':id')
    async destroy(
        @CurrentUser() user: Users,
        @Param('id') id: string,
    ) {

        if (user.client_id === null) {
            throw new BadRequestException(
                'User is not associated with a client',
            );
        }

        return this.criteriaService.destroy(
            user.client_id,
            Number(id),
        );
    }
}