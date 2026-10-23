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
  UploadedFile,
  UseInterceptors,
  UseGuards,
  Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { unlink } from 'fs/promises';
import * as path from 'path';

import { ApplicantTrainingsService } from './applicant-trainings.service';
import { CreateApplicantTrainingDto } from './dto/create-applicant-training.dto';
import { UpdateApplicantTrainingDto } from './dto/update-applicant-training.dto';
import { multerConfig } from 'src/common/upload/multer.config';
import { SanctumGuard } from 'src/auth/guards/sanctum.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { Users } from 'src/entities/users.entity';

@Controller()

export class ApplicantTrainingsController {
  constructor(
    private readonly applicantTrainingsService: ApplicantTrainingsService,
  ) { }

  private getRelativeFilePath(filePath: string): string {
    return path
      .relative(process.cwd(), filePath)
      .split(path.sep)
      .join('/');
  }

  private async removeUploadedFile(file?: Express.Multer.File) {
    if (!file?.path) return;

    try {
      await unlink(file.path);
    } catch (error) {
      console.error('Failed to clean up uploaded training file:', error);
    }
  }
  @Get('trainings')
  findAllTrainingsPaginated(
    @Query('page') page = '1',
    @Query('limit') limit = '10',
  ) {
    return this.applicantTrainingsService.findAllTrainingsPaginated(
      Number(page),
      Number(limit),
    );
  }
  @Post('applicant/trainings')
  @UseGuards(SanctumGuard)
  @UseInterceptors(
    FileInterceptor(
      'attachment',
      multerConfig('training'),
    ),
  )
  async create(
    @Req() req: any,
    @Body() dto: CreateApplicantTrainingDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (file) {
      dto.attachment = this.getRelativeFilePath(file.path);
    }

    try {
      return await this.applicantTrainingsService.create(
        req.user.id,
        dto,
      );
    } catch (error) {
      await this.removeUploadedFile(file);
      throw error;
    }
  }

  @Get('applicant/trainings')
  @UseGuards(SanctumGuard)
  async findAll(@Req() req: any) {
    return this.applicantTrainingsService.findAll(req.user.id);
  }

@UseGuards(SanctumGuard)
  @Get('applicant/trainings/:id')
  async findOne(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.applicantTrainingsService.findOne(
      req.user.id,
      id,
    );
  }

  @Patch('applicant/trainings/:id')
  @UseGuards(SanctumGuard)
  @UseInterceptors(
    FileInterceptor(
      'attachment',
      multerConfig('training'),
    ),
  )
  async update(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateApplicantTrainingDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (file) {
      dto.attachment = this.getRelativeFilePath(file.path);
    }

    try {
      return await this.applicantTrainingsService.update(
        req.user.id,
        id,
        dto,
      );
    } catch (error) {
      await this.removeUploadedFile(file);
      throw error;
    }
  }

  @Delete('applicant/trainings/:id')
  @UseGuards(SanctumGuard)
  async remove(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.applicantTrainingsService.remove(
      req.user.id,
      id,
    );
  }
}