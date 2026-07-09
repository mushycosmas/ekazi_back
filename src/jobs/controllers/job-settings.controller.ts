import { Body, Controller, Param, Put, UseGuards } from '@nestjs/common';
import { SanctumGuard } from 'src/auth/guards/sanctum.guard';
import { UpdateJobSettingsDto } from '../dtos/update-job-settings.dto';
import { JobSettingsService } from '../services/job-settings.service';

@Controller('job-settings')
export class JobSettingsController {
      constructor(
    private readonly jobSettingsService: JobSettingsService,
  ) {}

  @Put(':id')
  @UseGuards(SanctumGuard)
  updateSettings(
    @Param('id') id: string,
    @Body() dto: UpdateJobSettingsDto,
  ) {
    return this.jobSettingsService.updateSettings(
      Number(id),
      dto,
    );
  }
}
