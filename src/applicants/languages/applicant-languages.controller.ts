 import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';

import { ApplicantLanguagesService } from './applicant-languages.service';

import { CreateApplicantLanguageDto } from './dto/create-applicant-language.dto';
import { UpdateApplicantLanguageDto } from './dto/update-applicant-language.dto';


import { Users } from 'src/entities/users.entity';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { SanctumGuard } from 'src/auth/guards/sanctum.guard';

@Controller('applicant/languages')
@UseGuards(SanctumGuard)
export class ApplicantLanguagesController {
  constructor(
    private readonly applicantLanguagesService: ApplicantLanguagesService,
  ) {}

  // ============================================================
  // CREATE
  // ============================================================

  @Post()
  async create(
    @CurrentUser() user: Users,
    @Body() dto: CreateApplicantLanguageDto,
  ) {
    return this.applicantLanguagesService.create(
      user.id,
      dto,
    );
  }

  // ============================================================
  // GET MY LANGUAGES
  // ============================================================

  @Get()
  async findMyLanguages(
    @CurrentUser() user: Users,
  ) {
    return this.applicantLanguagesService.findMyLanguages(
      user.id,
    );
  }

  // ============================================================
  // GET ONE
  // ============================================================

  @Get(':id')
  async findOne(
    @CurrentUser() user: Users,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.applicantLanguagesService.findOne(
      user.id,
      id,
    );
  }

  // ============================================================
  // UPDATE
  // ============================================================

  @Patch(':id')
  async update(
    @CurrentUser() user: Users,

    @Param('id', ParseIntPipe)
    id: number,

    @Body()
    dto: UpdateApplicantLanguageDto,
  ) {
    return this.applicantLanguagesService.update(
      user.id,
      id,
      dto,
    );
  }

  // ============================================================
  // DELETE
  // ============================================================

  @Delete(':id')
  async remove(
    @CurrentUser() user: Users,

    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.applicantLanguagesService.remove(
      user.id,
      id,
    );
  }
}