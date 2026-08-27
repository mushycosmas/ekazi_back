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

import { TermConditionTypesService } from './term-condition-types.service';

import { CreateTermConditionTypeDto } from './dto/create-term-condition-type.dto';
import { UpdateTermConditionTypeDto } from './dto/update-term-condition-type.dto';
import { SanctumGuard } from 'src/auth/guards/sanctum.guard';

@Controller('term-condition-types')
export class TermConditionTypesController {
    constructor(
        private readonly termConditionTypesService: TermConditionTypesService,
    ) {}

    /**
     * POST /term-condition-types
     */
    @Post()
     @UseGuards(SanctumGuard)
    async create(
        @Body() createDto: CreateTermConditionTypeDto,
    ) {
        return {
            success: true,
            message: 'Term condition type created successfully',
            data: await this.termConditionTypesService.create(
                createDto,
            ),
        };
    }

    /**
     * GET /term-condition-types
     */
    @Get()
    async findAll() {
        return {
            success: true,
            data: await this.termConditionTypesService.findAll(),
        };
    }

    /**
     * GET /term-condition-types/:id
     */
    @Get(':id')
     @UseGuards(SanctumGuard)
    async findOne(
        @Param('id', ParseIntPipe) id: number,
    ) {
        return {
            success: true,
            data: await this.termConditionTypesService.findOne(id),
        };
    }

    /**
     * PUT /term-condition-types/:id
     */
    @Put(':id')
     @UseGuards(SanctumGuard)
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateDto: UpdateTermConditionTypeDto,
    ) {
        return {
            success: true,
            message: 'Term condition type updated successfully',
            data: await this.termConditionTypesService.update(
                id,
                updateDto,
            ),
        };
    }

    /**
     * PATCH /term-condition-types/:id/toggle-hide
     */
    @Patch(':id/toggle-hide')
     @UseGuards(SanctumGuard)
    async toggleHide(
        @Param('id', ParseIntPipe) id: number,
    ) {
        return {
            success: true,
            message: 'Term condition type visibility updated successfully',
            data: await this.termConditionTypesService.toggleHide(id),
        };
    }

    /**
     * DELETE /term-condition-types/:id
     */
    @Delete(':id')
     @UseGuards(SanctumGuard)
    async remove(
        @Param('id', ParseIntPipe) id: number,
    ) {
        return await this.termConditionTypesService.remove(id);
    }

    /**
     * PATCH /term-condition-types/:id/restore
     */
    @Patch(':id/restore')
     @UseGuards(SanctumGuard)
    async restore(
        @Param('id', ParseIntPipe) id: number,
    ) {
        return {
            success: true,
            message: 'Term condition type restored successfully',
            data: await this.termConditionTypesService.restore(id),
        };
    }
}