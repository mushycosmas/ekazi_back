import {
  Body,
  Controller,
  Param,
  ParseIntPipe,
  Put,
  UseGuards,
} from '@nestjs/common';
import { SanctumGuard } from 'src/auth/guards/sanctum.guard';
import { UpdateJobSettingsDto } from '../dtos/update-job-settings.dto';
import { JobSettingsService } from '../services/job-settings.service';

@Controller('employer/jobs')
export class JobSettingsController {
  constructor(
    private readonly jobSettingsService: JobSettingsService,
  ) {}

  @Put(':id/job-settings')
  @UseGuards(SanctumGuard)
  async updateSettings(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateJobSettingsDto,
  ) {
    return this.jobSettingsService.updateSettings(
      id,
      dto,
    );
  }
}