 import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';

import { ExperienceTypesService } from './experience-types.service';
import { CreateExperienceTypeDto } from './dto/create-experience-type.dto';
import { UpdateExperienceTypeDto } from './dto/update-experience-type.dto';
import { SanctumGuard } from 'src/auth/guards/sanctum.guard';

@Controller('experience-types')
@UseGuards(SanctumGuard)
export class ExperienceTypesController {
  constructor(
    private readonly experienceTypesService: ExperienceTypesService,
  ) {}

  @Post()
  create(@Body() dto: CreateExperienceTypeDto) {
    return this.experienceTypesService.create(dto);
  }

 @Get()
findAll(@Query('search') search?: string) {
  return this.experienceTypesService.findAll(search || '');
}
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.experienceTypesService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateExperienceTypeDto,
  ) {
    return this.experienceTypesService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.experienceTypesService.remove(id);
  }
}