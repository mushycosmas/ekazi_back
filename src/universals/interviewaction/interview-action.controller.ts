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

import { InterviewActionService } from './interview-action.service';

import { CreateInterviewActionDto } from './dto/create-interview-action.dto';
import { UpdateInterviewActionDto } from './dto/update-interview-action.dto';

import { SanctumGuard } from 'src/auth/guards/sanctum.guard';


@Controller('interview-actions')
@UseGuards(SanctumGuard)
export class InterviewActionController {
    constructor(
        private readonly interviewActionService:
            InterviewActionService,
    ) {}

    @Get()
    async index(
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 20,
        @Query('search') search: string = '',
    ) {
        return this.interviewActionService.index(
            Number(page),
            Number(limit),
            search,
        );
    }

    @Get(':id')
    async show(
        @Param('id', ParseIntPipe) id: number,
    ) {
        return this.interviewActionService.show(id);
    }

    @Post()
    async store(
        @Body() dto: CreateInterviewActionDto,
    ) {
        return this.interviewActionService.store(
            dto,
        );
    }

    @Patch(':id')
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateInterviewActionDto,
    ) {
        return this.interviewActionService.update(
            id,
            dto,
        );
    }

    @Delete(':id')
    async destroy(
        @Param('id', ParseIntPipe) id: number,
    ) {
        return this.interviewActionService.destroy(
            id,
        );
    }
}