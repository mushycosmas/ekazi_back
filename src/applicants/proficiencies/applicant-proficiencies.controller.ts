 
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  ParseIntPipe,
  Body,
  Req,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';
import { promises as fs } from 'fs';
import * as path from 'path';

import { ApplicantProficienciesService } from './applicant-proficiencies.service';
import { CreateApplicantProficiencyDto } from './dto/create-applicant-proficiency.dto';
import { UpdateApplicantProficiencyDto } from './dto/update-applicant-proficiency.dto';

// Keep these imports aligned with the paths used in your existing project.
import { SanctumGuard } from 'src/auth/guards/sanctum.guard';
import { multerConfig } from 'src/common/upload/multer.config';

interface AuthenticatedRequest extends Request {
  user: {
    id: number;
  };
}

@Controller('applicant/proficiencies')
@UseGuards(SanctumGuard)
export class ApplicantProficienciesController {
  constructor(
    private readonly applicantProficienciesService: ApplicantProficienciesService,
  ) {}

  private async removeUploadedFile(file?: Express.Multer.File) {
    if (!file?.path) return;

    try {
      await fs.unlink(file.path);
    } catch {
      // Ignore cleanup errors so the original request error is preserved.
    }
  }

  @Post()
  @UseInterceptors(
    FileInterceptor(
      'attachment',
      multerConfig('proficiencies'),
    ),
  )
  async create(
    @Req() req: AuthenticatedRequest,
    @Body() dto: CreateApplicantProficiencyDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const attachment = file
      ? path.relative(process.cwd(), file.path).split(path.sep).join('/')
      : undefined;

    try {
      return await this.applicantProficienciesService.create(
        req.user.id,
        dto,
        attachment,
      );
    } catch (error) {
      await this.removeUploadedFile(file);
      throw error;
    }
  }

  @Get()
  findAll(@Req() req: AuthenticatedRequest) {
    return this.applicantProficienciesService.findAll(req.user.id);
  }

  @Get(':id')
  findOne(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.applicantProficienciesService.findOne(req.user.id, id);
  }

  @Patch(':id')
  @UseInterceptors(
    FileInterceptor(
      'attachment',
      multerConfig('proficiencies'),
    ),
  )
  async update(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateApplicantProficiencyDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const attachment = file
      ? path.relative(process.cwd(), file.path).split(path.sep).join('/')
      : undefined;

    try {
      return await this.applicantProficienciesService.update(
        req.user.id,
        id,
        dto,
        attachment,
      );
    } catch (error) {
      await this.removeUploadedFile(file);
      throw error;
    }
  }

  @Delete(':id')
  remove(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.applicantProficienciesService.remove(req.user.id, id);
  }
}
