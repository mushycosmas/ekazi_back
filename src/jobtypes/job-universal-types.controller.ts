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
    Req,
    UseGuards,
} from '@nestjs/common';

import { JobUniversalTypesService } from './job-universal-types.service';

import { CreateJobUniversalTypeDto } from './dto/create-job-universal-type.dto';
import { UpdateJobUniversalTypeDto } from './dto/update-job-universal-type.dto';
import { SanctumGuard } from 'src/auth/guards/sanctum.guard';

@Controller('job-types')
export class JobUniversalTypesController {

    constructor(
        private readonly service: JobUniversalTypesService,
    ) {}

    @Post()
    @UseGuards(SanctumGuard)
    create(
        @Body() dto: CreateJobUniversalTypeDto,
        @Req() req,
    ) {
        return this.service.create(dto, req.user);
    }

    @Get()
    findAll(
        @Query('page') page = 1,
        @Query('limit') limit = 20,
        @Query('search') search?: string,
    ) {
        return this.service.findAll(
            Number(page),
            Number(limit),
            search,
        );
    }

    @Get(':id')

    findOne(
        @Param('id', ParseIntPipe) id: number,
    ) {
        return this.service.findOne(id);
    }

    @Patch(':id')
      @UseGuards(SanctumGuard)
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateJobUniversalTypeDto,
        @Req() req,
    ) {
        return this.service.update(
            id,
            dto,
            req.user,
        );
    }

    @Delete(':id')
    remove(
        @Param('id', ParseIntPipe) id: number,
    ) {
        return this.service.remove(id);
    }
}