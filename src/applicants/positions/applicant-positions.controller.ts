 
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';

import { ApplicantPositionsService } from './applicant-positions.service';
import { CreateApplicantPositionDto } from './dto/create-applicant-position.dto';
import { UpdateApplicantPositionDto } from './dto/update-applicant-position.dto';
import { SanctumGuard } from 'src/auth/guards/sanctum.guard';

interface AuthenticatedRequest extends Request {
  user: {
    id: number;
  };
}

@Controller('applicant/positions')
@UseGuards(SanctumGuard)
export class ApplicantPositionsController {
  constructor(
    private readonly applicantPositionsService: ApplicantPositionsService,
  ) {}

  @Post()
  create(
    @Req() req: AuthenticatedRequest,
    @Body() dto: CreateApplicantPositionDto,
  ) {
    return this.applicantPositionsService.create(req.user.id, dto);
  }

  @Get()
  findAll(@Req() req: AuthenticatedRequest) {
    return this.applicantPositionsService.findAll(req.user.id);
  }

  @Get(':id')
  findOne(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.applicantPositionsService.findOne(req.user.id, id);
  }

  @Patch(':id')
  update(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateApplicantPositionDto,
  ) {
    return this.applicantPositionsService.update(req.user.id, id, dto);
  }

  @Delete(':id')
  remove(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.applicantPositionsService.remove(req.user.id, id);
  }
}
