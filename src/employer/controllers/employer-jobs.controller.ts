import { Controller, Get, UseGuards, Query } from '@nestjs/common';
import { EmployerJobsService } from '../services/employer-jobs.service';
import { SanctumGuard } from 'src/auth/guards/sanctum.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { Users } from 'src/entities/users.entity';

@Controller('employer-jobs')
export class EmployerJobsController {
    constructor(
        private readonly employerJobsService: EmployerJobsService,
    ) { }
    @Get('jobs')
    @UseGuards(SanctumGuard)
    myJobs(
        @CurrentUser() user: Users,
        @Query('page') page = 1,
        @Query('limit') limit = 20,
        @Query('search') search?: string,
        @Query('industryId') industryId?: number,
        @Query('status') status?: string,
    ) {
        return this.employerJobsService.myjobs(user, {
            page: Number(page),
            limit: Number(limit),
            search,
            industryId: industryId ? Number(industryId) : undefined,
            status: status as 'active' | 'expired' | 'today' | 'all',
        });
    }
}
