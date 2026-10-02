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

import { EvaluationService } from './evaluation.service';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { SanctumGuard } from 'src/auth/guards/sanctum.guard';
import { Users } from 'src/entities/users.entity';

import { CreateEvaluationFormDto } from './dto/create-evaluation-form.dto';
import { UpdateEvaluationFormDto } from './dto/update-evaluation-form.dto';

import { CreateEvaluationDto } from './dto/create-evaluation.dto';
import { UpdateEvaluationDto } from './dto/update-evaluation.dto';

@Controller('evaluations')
@UseGuards(SanctumGuard)
export class EvaluationController {

    constructor(
        private readonly evaluationService: EvaluationService,
    ) {}


    /**
     * ============================================================
     * EVALUATIONS
     * ============================================================
     */


    /**
     * GET /api/evaluations
     *
     * Get evaluations belonging to the authenticated user's client.
     */
    @Get()
    async index(
        @CurrentUser() user: Users,
        @Query('page') page?: string,
        @Query('limit') limit?: string,
        @Query('search') search?: string,
    ) {

        if (user.client_id === null) {
            throw new BadRequestException(
                'User is not associated with a client',
            );
        }

        return this.evaluationService.evaluationIndex(
            user.client_id,
            Number(page) || 1,
            Number(limit) || 20,
            search || '',
        );
    }


    /**
     * POST /api/evaluations
     *
     * Create evaluation for authenticated user's client.
     */
    @Post()
    async store(
        @CurrentUser() user: Users,
        @Body() dto: CreateEvaluationDto,
    ) {

        if (user.client_id === null) {
            throw new BadRequestException(
                'User is not associated with a client',
            );
        }

        return this.evaluationService.evaluationStore(
            user.client_id,
            user.id,
            dto,
        );
    }


    /**
     * GET /api/evaluations/form
     */
    @Get('/form')
    async findAll(
        @CurrentUser() user: Users,
        @Query('page') page: string = '1',
        @Query('limit') limit: string = '20',
        @Query('search') search: string = '',
    ) {

        if (user.client_id === null) {
            throw new BadRequestException(
                'User is not associated with a client',
            );
        }

        return this.evaluationService.index(
            user.client_id,
            Number(page),
            Number(limit),
            search,
        );
    }


    /**
     * POST /api/evaluations/form
     */
    @Post('/form')
    async create(
        @CurrentUser() user: Users,
        @Body() data: CreateEvaluationFormDto,
    ) {

        if (user.client_id === null) {
            throw new BadRequestException(
                'User is not associated with a client',
            );
        }

        return this.evaluationService.store(
            user.client_id,
            data,
        );
    }


    /**
     * GET /api/evaluations/form/:id
     */
    @Get('/form/:id')
    async findOne(
        @CurrentUser() user: Users,
        @Param('id') id: string,
    ) {

        if (user.client_id === null) {
            throw new BadRequestException(
                'User is not associated with a client',
            );
        }

        return this.evaluationService.show(
            user.client_id,
            Number(id),
        );
    }


    /**
     * PATCH /api/evaluations/form/:id
     */
    @Patch('/form/:id')
    async update(
        @CurrentUser() user: Users,
        @Param('id') id: string,
        @Body() data: UpdateEvaluationFormDto,
    ) {

        if (user.client_id === null) {
            throw new BadRequestException(
                'User is not associated with a client',
            );
        }

        return this.evaluationService.update(
            user.client_id,
            Number(id),
            data,
        );
    }


    /**
     * DELETE /api/evaluations/form/:id
     */
    @Delete('/form/:id')
    async remove(
        @CurrentUser() user: Users,
        @Param('id') id: string,
    ) {

        if (user.client_id === null) {
            throw new BadRequestException(
                'User is not associated with a client',
            );
        }

        return this.evaluationService.destroy(
            user.client_id,
            Number(id),
        );
    }


    /**
     * GET /api/evaluations/:id
     *
     * Get one evaluation belonging to authenticated user's client.
     */
    @Get(':id')
    async showEvaluation(
        @CurrentUser() user: Users,
        @Param('id') id: string,
    ) {

        if (user.client_id === null) {
            throw new BadRequestException(
                'User is not associated with a client',
            );
        }

        return this.evaluationService.evaluationShow(
            user.client_id,
            Number(id),
        );
    }


    /**
     * PATCH /api/evaluations/:id
     *
     * Update evaluation belonging to authenticated user's client.
     */
    @Patch(':id')
    async updateEvaluation(
        @CurrentUser() user: Users,
        @Param('id') id: string,
        @Body() dto: UpdateEvaluationDto,
    ) {

        if (user.client_id === null) {
            throw new BadRequestException(
                'User is not associated with a client',
            );
        }

        return this.evaluationService.evaluationUpdate(
            user.client_id,
            Number(id),
            user.id,
            dto,
        );
    }


    /**
     * DELETE /api/evaluations/:id
     *
     * Delete evaluation belonging to authenticated user's client.
     */
    @Delete(':id')
    async destroyEvaluation(
        @CurrentUser() user: Users,
        @Param('id') id: string,
    ) {

        if (user.client_id === null) {
            throw new BadRequestException(
                'User is not associated with a client',
            );
        }

        return this.evaluationService.evaluationDestroy(
            user.client_id,
            Number(id),
            user.id,
        );
    }
}