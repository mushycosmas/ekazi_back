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

import { ApplicantKnowledgeService } from './applicant-knowledge.service';
import { SaveApplicantKnowledgeDto } from './dto/save-applicant-knowledge.dto';

import { SanctumGuard } from 'src/auth/guards/sanctum.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { Users } from 'src/entities/users.entity';

@Controller('applicant/knowledges')
@UseGuards(SanctumGuard)
export class ApplicantKnowledgeController {
  constructor(
    private readonly applicantKnowledgeService: ApplicantKnowledgeService,
  ) {}

  // ============================================================
  // SAVE / UPDATE
  // ============================================================

  @Post()
  async saveKnowledge(
    @CurrentUser() user: Users,
    @Body() dto: SaveApplicantKnowledgeDto,
  ) {
    return this.applicantKnowledgeService.saveKnowledge(
      user.id,
      dto,
    );
  }

  // ============================================================
  // GET ALL
  // ============================================================

  @Get()
  async findAll(
    @CurrentUser() user: Users,
  ) {
    return this.applicantKnowledgeService.findAll(
      user.id,
    );
  }

  // ============================================================
  // GET ONE
  // ============================================================

  @Get(':id')
  async findOne(
    @CurrentUser() user: Users,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.applicantKnowledgeService.findOne(
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
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.applicantKnowledgeService.remove(
      user.id,
      id,
    );
  }
}