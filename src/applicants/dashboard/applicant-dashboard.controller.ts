
import {
    Controller,
    Get,
    UseGuards,
} from '@nestjs/common';

import { ApplicantDashboardService } from './applicant-dashboard.service';
import { Users } from 'src/entities/users.entity';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { SanctumGuard } from 'src/auth/guards/sanctum.guard';

@Controller('applicant')
@UseGuards(SanctumGuard)
export class ApplicantDashboardController {
    constructor(
        private readonly applicantDashboardService: ApplicantDashboardService,
    ) { }

    @Get('/dashboard')
    async statisticsDashboard(@CurrentUser() user: Users) {
        return this.applicantDashboardService.statisticsDashboard(user.id);
    }


    @Get('/application-pipeline')
    async applicationPipeline(@CurrentUser() user: Users) {
        return this.applicantDashboardService.applicationPipeline(user.id);
    }
}
