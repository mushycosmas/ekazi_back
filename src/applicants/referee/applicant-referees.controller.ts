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

import { ApplicantRefereesService } from './applicant-referees.service';

import { CreateApplicantRefereeDto } from './dto/create-applicant-referee.dto';
import { UpdateApplicantRefereeDto } from './dto/update-applicant-referee.dto';

import { Users } from 'src/entities/users.entity';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { SanctumGuard } from 'src/auth/guards/sanctum.guard';

@Controller('applicant/referees')
@UseGuards(SanctumGuard)
export class ApplicantRefereesController {
  constructor(
    private readonly applicantRefereesService: ApplicantRefereesService,
  ) {}

  // ============================================================
  // CREATE
  // POST /api/applicant-referees
  // ============================================================

  @Post()
  async create(
    @CurrentUser() user: Users,
    @Body() dto: CreateApplicantRefereeDto,
  ) {
    return this.applicantRefereesService.create(
      user.id,
      dto,
    );
  }

  // ============================================================
  // GET MY REFEREES
  // GET /api/applicant-referees
  // ============================================================

  @Get()
  async findAll(
    @CurrentUser() user: Users,
  ) {
    return this.applicantRefereesService.findAll(
      user.id,
    );
  }

  // ============================================================
  // GET ONE
  // GET /api/applicant-referees/:id
  // ============================================================

  @Get(':id')
  async findOne(
    @CurrentUser() user: Users,

    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.applicantRefereesService.findOne(
      user.id,
      id,
    );
  }

  // ============================================================
  // UPDATE
  // PATCH /api/applicant-referees/:id
  // ============================================================

  @Patch(':id')
  async update(
    @CurrentUser() user: Users,

    @Param('id', ParseIntPipe)
    id: number,

    @Body()
    dto: UpdateApplicantRefereeDto,
  ) {
    return this.applicantRefereesService.update(
      user.id,
      id,
      dto,
    );
  }

  // ============================================================
  // DELETE
  // DELETE /api/applicant-referees/:id
  // ============================================================

  @Delete(':id')
  async remove(
    @CurrentUser() user: Users,

    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.applicantRefereesService.remove(
      user.id,
      id,
    );
  }
}