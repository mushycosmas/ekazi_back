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

import { BenefitService } from './benefit.service';

import { CreateBenefitDto } from './dto/create-benefit.dto';
import { UpdateBenefitDto } from './dto/update-benefit.dto';

import { SanctumGuard } from '../auth/guards/sanctum.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Users } from '../entities/users.entity';

@Controller('benefits')
@UseGuards(SanctumGuard)
export class BenefitController {
    constructor(
        private readonly benefitService: BenefitService,
    ) {}

    /**
     * GET /api/employer/benefits
     */
    @Get()
    async index(
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 20,
        @Query('search') search: string = '',
    ) {
        return this.benefitService.index(
            Number(page),
            Number(limit),
            search,
        );
    }

    /**
     * GET /api/employer/benefits/:id
     */
    @Get(':id')
    async show(
        @Param('id', ParseIntPipe) id: number,
    ) {
        return this.benefitService.show(id);
    }

    /**
     * POST /api/employer/benefits
     */
    @Post()
    async store(
        @CurrentUser() user: Users,
        @Body() dto: CreateBenefitDto,
    ) {
        return this.benefitService.store(
            user.id,
            dto,
        );
    }

    /**
     * PATCH /api/employer/benefits/:id
     */
    @Patch(':id')
    async update(
        @CurrentUser() user: Users,
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateBenefitDto,
    ) {
        return this.benefitService.update(
            id,
            user.id,
            dto,
        );
    }

    /**
     * DELETE /api/employer/benefits/:id
     */
    @Delete(':id')
    async destroy(
        @Param('id', ParseIntPipe) id: number,
    ) {
        return this.benefitService.destroy(id);
    }
}