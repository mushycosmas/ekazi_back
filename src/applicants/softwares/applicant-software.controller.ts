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

import { ApplicantSoftwareService } from './applicant-software.service';

import { SaveApplicantSoftwareDto } from './dto/save-applicant-software.dto';
import { SanctumGuard } from 'src/auth/guards/sanctum.guard';
import { Users } from 'src/entities/users.entity';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
 

@Controller('applicant/softwares')
@UseGuards(SanctumGuard)
export class ApplicantSoftwareController {
  constructor(
    private readonly applicantSoftwareService: ApplicantSoftwareService,
  ) {}

  // ============================================================
  // SAVE MULTIPLE SOFTWARE
  // ============================================================

  @Post()
  async saveSoftware(
    @CurrentUser() user: Users,
    @Body() dto: SaveApplicantSoftwareDto,
  ) {
    return this.applicantSoftwareService.saveSoftware(
      user.id,
      dto,
    );
  }

  // ============================================================
  // GET MY SOFTWARE
  // ============================================================

  @Get()
  async findAll(
    @CurrentUser() user: Users,
  ) {
    return this.applicantSoftwareService.findAll(
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
    return this.applicantSoftwareService.findOne(
      user.id,
      id,
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
    return this.applicantSoftwareService.remove(
      user.id,
      id,
    );
  }
}