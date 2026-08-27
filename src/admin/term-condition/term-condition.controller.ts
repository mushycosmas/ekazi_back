import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    ParseIntPipe,
    Patch,
    Post,
    Put,
    UseGuards,
} from '@nestjs/common';

import { TermConditionService } from './term-condition.service';
import { SanctumGuard } from 'src/auth/guards/sanctum.guard';

@Controller('term-conditions')
export class TermConditionController {
    constructor(
        private readonly termConditionService: TermConditionService,
    ) { }

    /**
     * Create
     * POST /term-conditions
     */
    @Post()
    @UseGuards(SanctumGuard)
    async create(
        @Body() data: any,
    ) {
        return {
            success: true,
            message: 'Term condition created successfully',
            data: await this.termConditionService.create(data),
        };
    }

    /**
     * Get all
     * GET /term-conditions
     */
    @Get()
    async findAll() {
        return {
            success: true,
            data: await this.termConditionService.findAll(),
        };
    }

    /**
     * Get one
     * GET /term-conditions/:id
     */
    @Get(':id')
    @UseGuards(SanctumGuard)
    async findOne(
        @Param('id', ParseIntPipe) id: number,
    ) {
        return {
            success: true,
            data: await this.termConditionService.findOne(id),
        };
    }

    /**
     * Update
     * PUT /term-conditions/:id
     */
    @Put(':id')
    @UseGuards(SanctumGuard)
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() data: any,
    ) {
        return {
            success: true,
            message: 'Term condition updated successfully',
            data: await this.termConditionService.update(
                id,
                data,
            ),
        };
    }

    /**
     * Soft delete
     * DELETE /term-conditions/:id
     */
    @Delete(':id')
    @UseGuards(SanctumGuard)
    async remove(
        @Param('id', ParseIntPipe) id: number,
    ) {
        return await this.termConditionService.remove(id);
    }

    /**
     * Restore
     * PATCH /term-conditions/:id/restore
     */
    @Patch(':id/restore')
    @UseGuards(SanctumGuard)
    async restore(
        @Param('id', ParseIntPipe) id: number,
    ) {
        return {
            success: true,
            message: 'Term condition restored successfully',
            data: await this.termConditionService.restore(id),
        };
    }
}