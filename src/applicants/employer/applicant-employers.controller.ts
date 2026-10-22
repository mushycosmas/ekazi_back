import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Patch,
    Delete,
    ParseIntPipe,
    Query,
    UseGuards,
} from '@nestjs/common';

import { ApplicantEmployersService } from
    './applicant-employers.service';

import { CreateApplicantEmployerDto } from
    './dto/create-applicant-employer.dto';

import { UpdateApplicantEmployerDto } from
    './dto/update-applicant-employer.dto';
import { SanctumGuard } from 'src/auth/guards/sanctum.guard';

@Controller('applicant-employers')
@UseGuards(SanctumGuard)
export class ApplicantEmployersController {
    constructor(
        private readonly applicantEmployersService: ApplicantEmployersService,
    ) { }

    @Post()
    create(@Body() dto: CreateApplicantEmployerDto) {
        return this.applicantEmployersService.create(dto);
    }

    @Get()
    findAll(
        @Query('page') page?: string,
        @Query('limit') limit?: string,
        @Query('search') search?: string,
    ) {
        return this.applicantEmployersService.findAll(
            Number(page) || 1,
            Number(limit) || 20,
            search || '',
        );
    }
    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.applicantEmployersService.findOne(id);
    }

    @Patch(':id')
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateApplicantEmployerDto,
    ) {
        return this.applicantEmployersService.update(id, dto);
    }

    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.applicantEmployersService.remove(id);
    }
}