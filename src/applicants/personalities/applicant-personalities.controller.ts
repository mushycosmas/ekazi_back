 import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';

import { ApplicantPersonalitiesService } from './applicant-personalities.service';
import { SaveApplicantPersonalitiesDto } from './dto/save-applicant-personalities.dto';

import { SanctumGuard } from 'src/auth/guards/sanctum.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { Users } from 'src/entities/users.entity';

@Controller('applicant/personalities')
@UseGuards(SanctumGuard)
export class ApplicantPersonalitiesController {
  constructor(
    private readonly applicantPersonalitiesService: ApplicantPersonalitiesService,
  ) {}

  // =========================================================
  // SAVE MULTIPLE PERSONALITIES
  // =========================================================
  @Post()
  async savePersonalities(
    @CurrentUser() user: Users,
    @Body() dto: SaveApplicantPersonalitiesDto,
  ) {
    return this.applicantPersonalitiesService.savePersonalities(
      user.id,
      dto,
    );
  }

  // =========================================================
  // GET ALL
  // =========================================================
  @Get()
  async findAll(
    @CurrentUser() user: Users,
  ) {
    return this.applicantPersonalitiesService.findAll(
      user.id,
    );
  }

  // =========================================================
  // GET ONE
  // =========================================================
  @Get(':id')
  async findOne(
    @CurrentUser() user: Users,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.applicantPersonalitiesService.findOne(
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
    return this.applicantPersonalitiesService.remove(
      user.id,
      id,
    );
  }
  @Put()
async updatePersonalities(
  @CurrentUser() user: Users,
  @Body() dto: SaveApplicantPersonalitiesDto,
) {
  return this.applicantPersonalitiesService.updatePersonalities(
    user.id,
    dto,
  );
}
}