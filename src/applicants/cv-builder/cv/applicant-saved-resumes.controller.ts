 import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';

import { ApplicantSavedResumesService } from './applicant-saved-resumes.service';
import { CreateSavedResumeDto } from './dto/create-saved-resume.dto';
import { UpdateSavedResumeDto } from './dto/update-saved-resume.dto';

import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { SanctumGuard } from 'src/auth/guards/sanctum.guard';
import { Users } from 'src/entities/users.entity';

@Controller('applicant/saved-resumes')
@UseGuards(SanctumGuard)
export class ApplicantSavedResumesController {
  constructor(
    private readonly savedResumesService: ApplicantSavedResumesService,
  ) {}

  // POST /api/applicant/saved-resumes
  @Post()
  create(
    @CurrentUser() user: Users,
    @Body() dto: CreateSavedResumeDto,
  ) {
    return this.savedResumesService.create(user.id, dto);
  }

  // GET /api/applicant/saved-resumes
  @Get()
  findAll(@CurrentUser() user: Users) {
    return this.savedResumesService.findAll(user.id);
  }

  // GET /api/applicant/saved-resumes/:id
  @Get(':id')
  findOne(
    @CurrentUser() user: Users,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.savedResumesService.findOne(user.id, id);
  }

  // PATCH /api/applicant/saved-resumes/:id
  @Patch(':id')
  update(
    @CurrentUser() user: Users,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateSavedResumeDto,
  ) {
    return this.savedResumesService.update(user.id, id, dto);
  }

  // DELETE /api/applicant/saved-resumes/:id
  @Delete(':id')
  remove(
    @CurrentUser() user: Users,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.savedResumesService.remove(user.id, id);
  }
}