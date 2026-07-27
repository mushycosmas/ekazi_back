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


import { InterviewTypeService } from './interview-type.service';
import { CreateInterviewTypeDto } from './dto/create-interview-type.dto';
import { UpdateInterviewTypeDto } from './dto/update-intreview-type.dto';
import { SanctumGuard } from 'src/auth/guards/sanctum.guard';

@Controller('interview-types')
export class InterviewTypeController {
    constructor(
        private readonly service: InterviewTypeService,
    ) { }

    @Post()
    @UseGuards(SanctumGuard)
    create(
        @Body() dto: CreateInterviewTypeDto,
        @Req() req,
    ) {
        return this.service.create(dto, req.user);
    }

    @Get()
    @UseGuards(SanctumGuard)
    findAll(
 
    ) {
        return this.service.findAll(
           
        );
    }

    @Get(':id')
    @UseGuards(SanctumGuard)
    findOne(
        @Param('id', ParseIntPipe) id: number,
    ) {
        return this.service.findOne(id);
    }

    @Patch(':id')
    @UseGuards(SanctumGuard)
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateInterviewTypeDto,
        @Req() req,
    ) {
        return this.service.update(
            id,
            dto,
            req.user,
        );
    }

    @Delete(':id')
    @UseGuards(SanctumGuard)
    remove(
        @Param('id', ParseIntPipe) id: number,
    ) {
        return this.service.remove(id);
    }
}