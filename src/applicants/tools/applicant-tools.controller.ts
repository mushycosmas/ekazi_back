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

import { ApplicantToolsService } from './applicant-tools.service';

import { SaveApplicantToolsDto } from './dto/save-applicant-tools.dto';
import { SanctumGuard } from 'src/auth/guards/sanctum.guard';
import { Users } from 'src/entities/users.entity';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';

 
@Controller('applicant/tools')
@UseGuards(SanctumGuard)
export class ApplicantToolsController {
  constructor(
    private readonly applicantToolsService: ApplicantToolsService,
  ) {}

  // ============================================================
  // SAVE / UPDATE MULTIPLE TOOLS
  // ============================================================

  @Post()
  async saveTools(
    @CurrentUser() user: Users,
    @Body() dto: SaveApplicantToolsDto,
  ) {
    return this.applicantToolsService.saveTools(
      user.id,
      dto,
    );
  }

  // ============================================================
  // GET MY TOOLS
  // ============================================================

  @Get()
  async findAll(
    @CurrentUser() user: Users,
  ) {
    return this.applicantToolsService.findAll(
      user.id,
    );
  }

  // ============================================================
  // GET ONE
  // ============================================================

  @Get(':id')
  async findOne(
    @CurrentUser() user: Users,

    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.applicantToolsService.findOne(
      user.id,
      id,
    );
  }

  // ============================================================
  // REMOVE TOOL
  // ============================================================

  @Delete(':id')
  async remove(
    @CurrentUser() user: Users,

    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.applicantToolsService.remove(
      user.id,
      id,
    );
  }
}