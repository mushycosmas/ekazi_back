 import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    Query,
    ParseIntPipe,
} from '@nestjs/common';

import { PositionCategoriesService } from './position-categories.service';
import { CreatePositionCategoryDto } from './dto/create-position-category.dto';
import { UpdatePositionCategoryDto } from './dto/update-position-category.dto';

@Controller('job-categories')
export class PositionCategoriesController {
    constructor(
        private readonly categoriesService: PositionCategoriesService,
    ) {}

    @Post()
    create(@Body() dto: CreatePositionCategoryDto) {
        return this.categoriesService.create(dto);
    }

    @Get()
    findAll(
        @Query('page') page = 1,
        @Query('limit') limit = 20,
        @Query('search') search = '',
    ) {
        return this.categoriesService.findAll(page, limit, search);
    }

    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.categoriesService.findOne(id);
    }

    @Put(':id')
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdatePositionCategoryDto,
    ) {
        return this.categoriesService.update(id, dto);
    }

    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.categoriesService.remove(id);
    }
}