import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Body,
    Param,
    ParseIntPipe,
} from '@nestjs/common';

import { MetaKeywordsService } from './meta-keywords.service';
import { CreateMetaKeywordDto } from './dto/create-meta-keyword.dto';
import { UpdateMetaKeywordDto } from './dto/update-meta-keyword.dto';

@Controller('meta-keywords')
export class MetaKeywordsController {
    constructor(
        private readonly service: MetaKeywordsService,
    ) {}

    @Post()
    create(@Body() dto: CreateMetaKeywordDto) {
        return this.service.create(dto);
    }

    @Get()
    findAll() {
        return this.service.findAll();
    }

    @Get(':id')
    findOne(
        @Param('id', ParseIntPipe) id: number,
    ) {
        return this.service.findOne(id);
    }

    @Patch(':id')
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateMetaKeywordDto,
    ) {
        return this.service.update(id, dto);
    }

    @Delete(':id')
    remove(
        @Param('id', ParseIntPipe) id: number,
    ) {
        return this.service.remove(id);
    }
}