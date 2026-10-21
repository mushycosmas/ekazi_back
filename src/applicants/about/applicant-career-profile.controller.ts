import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  UseGuards,
} from '@nestjs/common';


import { SaveApplicantCareerDto } from './dto/save-applicant-career.dto';
import { ApplicantCareersService } from './applicant-career-profile.service';

import { SanctumGuard } from 'src/auth/guards/sanctum.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { Users } from 'src/entities/users.entity';

@Controller('applicant/career-profile')
@UseGuards(SanctumGuard)
export class ApplicantCareersController {
  constructor(
    private readonly applicantCareersService: ApplicantCareersService,
  ) {}

  // ============================================================
  // CREATE / UPDATE
  // ============================================================

  @Post()
  async saveCareer(
    @CurrentUser() user: Users,
    @Body() dto: SaveApplicantCareerDto,
  ) {
    return this.applicantCareersService.saveCareer(
      user.id,
      dto,
    );
  }

  // ============================================================
  // GET MY CAREER
  // ============================================================

  @Get()
  async findOne(
    @CurrentUser() user: Users,
  ) {
    return this.applicantCareersService.findOne(
      user.id,
    );
  }

  // ============================================================
  // DELETE MY CAREER
  // ============================================================

  @Delete()
  async remove(
    @CurrentUser() user: Users,
  ) {
    return this.applicantCareersService.remove(
      user.id,
    );
  }
}