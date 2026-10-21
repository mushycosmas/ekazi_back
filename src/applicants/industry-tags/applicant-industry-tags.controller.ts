import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    ParseArrayPipe,
    ParseIntPipe,
    Patch,
    Post,
    UseGuards,
} from '@nestjs/common';

import { ApplicantIndustryTagsService } from
    './applicant-industry-tags.service';

import { CreateApplicantIndustryTagDto } from
    './dto/create-applicant-industry-tag.dto';

import { UpdateApplicantIndustryTagDto } from
    './dto/update-applicant-industry-tag.dto';

import { SanctumGuard } from
    'src/auth/guards/sanctum.guard';

import { CurrentUser } from
    'src/auth/decorators/current-user.decorator';

import { Users } from 'src/entities/users.entity';

@Controller('applicant/industry-tags')
@UseGuards(SanctumGuard)
export class ApplicantIndustryTagsController {
    constructor(
        private readonly service: ApplicantIndustryTagsService,
    ) { }

    @Post()
    create(
        @CurrentUser() user: Users,
        @Body(new ParseArrayPipe({
            items: CreateApplicantIndustryTagDto,
        }))
        dtos: CreateApplicantIndustryTagDto[],
    ) {
        return this.service.createMany(user.id, dtos);
    }

    @Get()
    findAll(@CurrentUser() user: Users) {
        return this.service.findAll(user.id);
    }

    @Get(':id')
    findOne(
        @CurrentUser() user: Users,
        @Param('id', ParseIntPipe) id: number,
    ) {
        return this.service.findOne(user.id, id);
    }

    @Patch(':id')
    update(
        @CurrentUser() user: Users,
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateApplicantIndustryTagDto,
    ) {
        return this.service.update(
            user.id,
            id,
            dto,
        );
    }

    @Delete(':id')
    remove(
        @CurrentUser() user: Users,
        @Param('id', ParseIntPipe) id: number,
    ) {
        return this.service.remove(user.id, id);
    }
}