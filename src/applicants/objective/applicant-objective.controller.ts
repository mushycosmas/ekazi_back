 import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  UseGuards,
} from '@nestjs/common';


import { ApplicantObjectivesService } from './applicant-objective.service';
import { SaveApplicantObjectiveDto } from './dto/save-applicant-objective.dto';

import { SanctumGuard } from 'src/auth/guards/sanctum.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { Users } from 'src/entities/users.entity';

@Controller('applicant/objectives')
@UseGuards(SanctumGuard)
export class ApplicantObjectivesController {
  constructor(
    private readonly applicantObjectivesService: ApplicantObjectivesService,
  ) {}

  // ============================================================
  // CREATE / UPDATE
  // ============================================================

  @Post()
  async saveObjective(
    @CurrentUser() user: Users,
    @Body() dto: SaveApplicantObjectiveDto,
  ) {
    return this.applicantObjectivesService.saveObjective(
      user.id,
      dto,
    );
  }

  // ============================================================
  // GET MY OBJECTIVE
  // ============================================================

  @Get()
  async findOne(
    @CurrentUser() user: Users,
  ) {
    return this.applicantObjectivesService.findOne(
      user.id,
    );
  }

  // ============================================================
  // DELETE MY OBJECTIVE
  // ============================================================

  @Delete()
  async remove(
    @CurrentUser() user: Users,
  ) {
    return this.applicantObjectivesService.remove(
      user.id,
    );
  }
}