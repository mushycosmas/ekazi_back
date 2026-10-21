 import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';

import { ApplicantCulturesService } from './applicant-cultures.service';
import { SaveApplicantCulturesDto } from './dto/save-applicant-cultures.dto';

import { SanctumGuard } from 'src/auth/guards/sanctum.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { Users } from 'src/entities/users.entity';

@Controller('applicant/cultures')
@UseGuards(SanctumGuard)
export class ApplicantCulturesController {
  constructor(
    private readonly applicantCulturesService: ApplicantCulturesService,
  ) {}

  // =========================================================
  // SAVE MULTIPLE CULTURES
  // =========================================================
  @Post()
  async saveCultures(
    @CurrentUser() user: Users,
    @Body() dto: SaveApplicantCulturesDto,
  ) {
    return this.applicantCulturesService.saveCultures(
      user.id,
      dto,
    );
  }

  // =========================================================
  // GET MY CULTURES
  // =========================================================
  @Get()
  async findAll(@CurrentUser() user: Users) {
    return this.applicantCulturesService.findAll(user.id);
  }

  // =========================================================
  // GET ONE
  // =========================================================
  @Get(':id')
  async findOne(
    @CurrentUser() user: Users,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.applicantCulturesService.findOne(
      user.id,
      id,
    );
  }

  // =========================================================
  // DELETE
  // =========================================================
  @Delete(':id')
  async remove(
    @CurrentUser() user: Users,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.applicantCulturesService.remove(
      user.id,
      id,
    );
  }
}