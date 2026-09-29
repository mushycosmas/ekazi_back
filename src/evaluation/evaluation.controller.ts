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
export class EvaluationController {
    constructor(
        private readonly evaluationService: EvaluationService,
    ) { }


    @Get()
    @UseGuards(SanctumGuard)
    async index(
        @CurrentUser() user: Users,
        @Query('page') page?: number,
        @Query('limit') limit?: number,
        @Query('search') search?: string,
    ) {
        return this.evaluationService.evaluationIndex(
            user.id,
            Number(page) || 1,
            Number(limit) || 20,
            search || '',
        );
    }

    /**
     * POST /api/employer/evaluations
     */
    @Post()
    @UseGuards(SanctumGuard)
    async store(
        @CurrentUser() user: Users,
        @Body() dto: CreateEvaluationDto,
    ) {
        return this.evaluationService.evaluationStore(
            user.id,
            dto,
        );
    }

    /**
     * GET /api/employer/evaluations/:id
     */
    @Get(':id')
    @UseGuards(SanctumGuard)
    async show(
        @CurrentUser() user: Users,
        @Param('id') id: number,
    ) {
        return this.evaluationService.evaluationShow(
            Number(id),
            user.id,
        );
    }

    /**
     * PATCH /api/employer/evaluations/:id
     */
    @Patch(':id')
    @UseGuards(SanctumGuard)
    async updateevaluation(
        @CurrentUser() user: Users,
        @Param('id') id: number,
        @Body() dto: UpdateEvaluationDto,
    ) {
        return this.evaluationService.evaluationUpdate(
            Number(id),
            user.id,
            dto,
        );
    }

    /**
     * DELETE /api/employer/evaluations/:id
     */
    @Delete(':id')
    @UseGuards(SanctumGuard)
    async destroy(
        @CurrentUser() user: Users,
        @Param('id') id: number,
    ) {
        return this.evaluationService.evaluationDestroy(
            Number(id),
            user.id,
        );
    }

    @Post('/form')
    @UseGuards(SanctumGuard)
    create(
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

    @Get('/form')
    @UseGuards(SanctumGuard)
    findAll(
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

    @Get('/form/:id')
    @UseGuards(SanctumGuard)
    findOne(
        @CurrentUser() user: Users,
        @Param('id') id: number) {
        if (user.client_id === null) {
            throw new BadRequestException(
                'User is not associated with a client',
            );
        }

        return this.evaluationService.show(user.client_id, Number(id))
    }

    @Patch('/form/:id')
    @UseGuards(SanctumGuard)
    update(
        @CurrentUser() user: Users,
        @Param('id') id: number,
        @Body() data: UpdateEvaluationFormDto
    ) {
        if (user.client_id === null) {
            throw new BadRequestException(
                'User is not associated with a client',
            );
        }
        return this.evaluationService.update(user.client_id, Number(id), data)
    }

    @Delete('/form/:id')
    @UseGuards(SanctumGuard)
    remove(
        @CurrentUser() user: Users,
        @Param('id') id: number) {
        if (user.client_id === null) {
            throw new BadRequestException(
                'User is not associated with a client',
            );
        }
        return this.evaluationService.destroy(user.client_id, Number(id))
    }
}