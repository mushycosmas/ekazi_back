import { Controller, Get, UseGuards, Req, Put, Body, Param, Query, ParseIntPipe } from '@nestjs/common';
import { SanctumGuard } from 'src/auth/guards/sanctum.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { EmployerService } from './employer.service';
import { Users } from 'src/entities/users.entity';
import { UpdateCompanyProfileDto } from 'src/client/dto/update-company-profile.dto';

@Controller('employer')
export class EmployerController {
  constructor(
    private readonly employerService: EmployerService,
  ) { }

  @UseGuards(SanctumGuard)
  @Get('account')
  employerAccount(@CurrentUser() user: Users) {
    return this.employerService.employerAccount(user);
  }

  @Get('company-profile')
  @UseGuards(SanctumGuard)
  getCompanyProfile(@Req() req: any) {
    return this.employerService.getCompanyProfile(req.user);
  }

  // =========================
  // UPDATE COMPANY PROFILE
  // =========================
  @UseGuards(SanctumGuard)
  @Put('company-profile')
  updateCompanyProfile(
    @Req() req,
    @Body() dto: UpdateCompanyProfileDto,
  ) {
    return this.employerService.updateCompanyProfile(req.user, dto);
  }

  @Get('jobs/:jobId/applications')
  @UseGuards(SanctumGuard)
  getApplicants(
    @Req() req,
    @Param('jobId', ParseIntPipe) jobId: number,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Query('search') search?: string,
    @Query('stage_id') stageId?: number,
  ) {
    return this.employerService.getApplicantsByJob(
      req.user,
      jobId,
      Number(page),
      Number(limit),
      search,
      stageId ? Number(stageId) : undefined,
    );
  }
  @Get('jobs/:jobId/applications-by-stage')
  @UseGuards(SanctumGuard)
  getByStage(
    @Req() req,
    @Param('jobId', ParseIntPipe) jobId: number,
    @Query('stage') stage?: number,
    @Query('search') search?: string,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    return this.employerService.getJobStageHistory(req.user,
      jobId,
      Number(page),
      Number(limit),
      search,
      stage ? Number(stage) : undefined);
  }
}


