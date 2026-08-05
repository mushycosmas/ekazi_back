import { Controller, Get, NotFoundException, Param, Query, Req, UseGuards } from '@nestjs/common';
import { ApplicantService } from './applicant.service';
import { SanctumGuard } from 'src/auth/guards/sanctum.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { Users } from 'src/entities/users.entity';

@Controller('jobseekers')
export class ApplicantController {
    constructor(private readonly applicantService: ApplicantService) { }


    @Get()
    @UseGuards(SanctumGuard)
    async getApplicants(
        @Query('page') page = 1,
        @Query('limit') limit = 20,
        @Query('search') search?: string,
        @Query('position') position?: string,
        @Query('education_level_id') education_level_id?: number,
        @Query('industry_id') industry_id?: number,
        @Query('position_level_id') position_level_id?: number,
    ) {
        return this.applicantService.getJobseekers(
            Number(page),
            Number(limit),
            search,
            position,
            education_level_id
                ? Number(education_level_id)
                : undefined,
            industry_id
                ? Number(industry_id)
                : undefined,
            position_level_id
                ? Number(position_level_id)
                : undefined,
        );
    }
      @Get(':id')
  @UseGuards(SanctumGuard)
  async getApplicant(@Param('id') id: string) {
    const applicant = await this.applicantService.getApplicant(+id);
    if (!applicant) {
      throw new NotFoundException(
        {
          success: false,
          message: 'Applicant not found'
        }

      );
    }
    return applicant;
  }
    @Get('applicant')
    @UseGuards(SanctumGuard)
    async getClientApplicants(
        @CurrentUser() user: Users,
        @Query('page') page = 1,
        @Query('limit') limit = 20,
        @Query('search') search?: string,
        @Query('position') position?: string,
        @Query('education_level_id') education_level_id?: number,
        @Query('industry_id') industry_id?: number,
        @Query('position_level_id') position_level_id?: number,
    ) {
        return this.applicantService.getClientApplicants(
            user,
            Number(page),
            Number(limit),
            search,
            position,
            education_level_id ? Number(education_level_id) : undefined,
            industry_id ? Number(industry_id) : undefined,
            position_level_id ? Number(position_level_id) : undefined,
        );
    }
    @Get(':id/profile-completion')
    @UseGuards(SanctumGuard)
    async profileCompletion(
        @Param('id') id: number
    ) {

        return this.applicantService
            .getApplicantProfileCompletion(Number(id));

    }
}


