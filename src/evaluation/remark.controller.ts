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

import { RemarkService } from './remark.service';
import { CreateRemarkDto } from './dto/create-remark.dto';
import { UpdateRemarkDto } from './dto/update-remark.dto';

import { SanctumGuard } from '../auth/guards/sanctum.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Users } from '../entities/users.entity';

@Controller('remarks')
@UseGuards(SanctumGuard)
export class RemarkController {
    constructor(
        private readonly remarkService: RemarkService,
    ) {}

    @Get()
    async index(
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 20,
        @Query('search') search: string = '',
    ) {
        return this.remarkService.index(
            Number(page),
            Number(limit),
            search,
        );
    }

    @Get(':id')
    async show(
        @Param('id', ParseIntPipe) id: number,
    ) {
        return this.remarkService.show(id);
    }

    @Post()
    async store(
        @CurrentUser() user: Users,
        @Body() dto: CreateRemarkDto,
    ) {
        return this.remarkService.store(
            user.id,
            dto,
        );
    }

    @Patch(':id')
    async update(
        @CurrentUser() user: Users,
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateRemarkDto,
    ) {
        return this.remarkService.update(
            id,
            user.id,
            dto,
        );
    }

    @Delete(':id')
    async destroy(
        @Param('id', ParseIntPipe) id: number,
    ) {
        return this.remarkService.destroy(id);
    }
}