import { Controller, Get, UseGuards } from '@nestjs/common';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { SanctumGuard } from 'src/auth/guards/sanctum.guard';
import { Users } from 'src/entities/users.entity';
import { EmployerDashboardService } from '../services/employer-dashboard.service';

@Controller('employer-dashboard')
export class EmployerDashboardController {
    constructor(
        private readonly employerDashboardService: EmployerDashboardService,
    ) { }
    @Get('dashboard-stats')
    @UseGuards(SanctumGuard)
    dashboardStats(@CurrentUser() user: Users) {
        return this.employerDashboardService.dashboardStats(user);
    }
}
