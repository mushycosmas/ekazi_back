import { Controller, Get, NotFoundException, Param, Query, UseGuards } from '@nestjs/common';
import { AdminApplicantsService } from './admin-applicants.service';
import { SanctumGuard } from 'src/auth/guards/sanctum.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { Users } from 'src/entities/users.entity';

 @Controller('admin')
export class AdminApplicantsController {
    constructor(
        private readonly applicantService: AdminApplicantsService,
    ) {}

    /**
     * GET /admin/applicants
     * Get ALL applicants with pagination and filters
     */
    @Get('applicants')
    @UseGuards(SanctumGuard)
    async getAllApplicants(
        @Query('page') page = '1',
        @Query('limit') limit = '20',
        @Query('search') search?: string,
        @Query('position') position?: string,
        @Query('education_level_id') education_level_id?: string,
        @Query('industry_id') industry_id?: string,
        @Query('position_level_id') position_level_id?: string,
    ) {
        return this.applicantService.getClientApplicants(
            Number(page) > 0 ? Number(page) : 1,
            Number(limit) > 0 ? Number(limit) : 20,
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

    /**
     * GET /admin/applicants/:id/profile-completion
     */
    @Get(':id/profile-completion')
    @UseGuards(SanctumGuard)
    async profileCompletion(
        @Param('id') id: string,
    ) {
        return this.applicantService.getApplicantProfileCompletion(
            Number(id),
        );
    }

    /**
     * GET /admin/applicants/:id
     */
    @Get('applicants/:id')
    @UseGuards(SanctumGuard)
    async getApplicant(
        @Param('id') id: string,
    ) {
        const applicant =
            await this.applicantService.getApplicant(Number(id));

        if (!applicant) {
            throw new NotFoundException({
                success: false,
                message: 'Applicant not found',
            });
        }

        return applicant;
    }
}
