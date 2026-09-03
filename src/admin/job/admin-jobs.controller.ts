import { Controller, Get, Param, ParseIntPipe, Query, UseGuards } from '@nestjs/common';
import { SanctumGuard } from 'src/auth/guards/sanctum.guard';
import { AdminJobsService } from './admin-jobs.service';

@Controller('admin')
export class AdminJobsController {
    constructor(

        private readonly jobService: AdminJobsService


    ) { }

    @Get('jobs')
    @UseGuards(SanctumGuard)
    myJobs(
        @Query('page') page = 1,
        @Query('limit') limit = 20,
        @Query('search') search?: string,
        @Query('industryId') industryId?: number,
        @Query('status') status?: string,
        @Query('published') published?: string,
    ) {
        return this.jobService.jobs({
            page: Number(page),
            limit: Number(limit),
            search,

            industryId: industryId
                ? Number(industryId)
                : undefined,

            status: status as
                | 'active'
                | 'expired'
                | 'today'
                | 'all',

            published: published as
                | 'published'
                | 'unpublished'
                | 'all',
        });
    }

        @Get('jobs/:id')
        @UseGuards(SanctumGuard)
        async myJobDetail(
            
            @Param('id', ParseIntPipe) id: number,
        ) {
            return this.jobService.myJobDetail( id);
        }
    
      
}
