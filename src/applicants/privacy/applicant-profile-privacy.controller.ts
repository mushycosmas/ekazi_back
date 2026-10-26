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

import { ApplicantProfilePrivacyService } from './applicant-profile-privacy.service';
import { UpsertProfilePrivacyDto } from './dto/upsert-profile-privacy.dto';
import { SaveProfilePrivacyBulkDto } from './dto/save-profile-privacy-bulk.dto';


import { SanctumGuard } from 'src/auth/guards/sanctum.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { Users } from 'src/entities/users.entity';

@Controller('applicant/profile-privacy')
@UseGuards(SanctumGuard)
export class ApplicantProfilePrivacyController {
  constructor(
    private readonly privacyService: ApplicantProfilePrivacyService,
  ) {}

  @Get()
  findAll(@CurrentUser() user: Users) {
    return this.privacyService.findAll(user.id);
  }

  @Get(':statusId')
  findOne(
    @CurrentUser() user: Users,
    @Param('statusId', ParseIntPipe) statusId: number,
  ) {
    return this.privacyService.findOne(user.id, statusId);
  }

  @Put()
  upsert(
    @CurrentUser() user: Users,
    @Body() dto: UpsertProfilePrivacyDto,
  ) {
    return this.privacyService.upsert(user.id, dto);
  }

  @Post('bulk')
  saveBulk(
    @CurrentUser() user: Users,
    @Body() dto: SaveProfilePrivacyBulkDto,
  ) {
    return this.privacyService.saveBulk(user.id, dto);
  }

  @Delete(':statusId')
  remove(
    @CurrentUser() user: Users,
    @Param('statusId', ParseIntPipe) statusId: number,
  ) {
    return this.privacyService.remove(user.id, statusId);
  }
}