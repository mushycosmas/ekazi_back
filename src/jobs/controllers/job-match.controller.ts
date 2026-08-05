import { Controller, Get, Param, ParseIntPipe, Query, UseGuards } from '@nestjs/common';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { SanctumGuard } from 'src/auth/guards/sanctum.guard';
import { Users } from 'src/entities/users.entity';
import { JobMatchService } from '../services/job-match.service';

@Controller('job-match')
export class JobMatchController {
    constructor(
        private readonly jobMatchService: JobMatchService,
    ) { }

    @Get(':jobId/match-applicants')
    @UseGuards(SanctumGuard)
    async findApplicantsByJob(
        @Param('jobId', ParseIntPipe) jobId: number,
        @Query('page') page = 1,
        @Query('limit') limit = 20,
        @Query('search') search?: string,
    ) {

        return this.jobMatchService.findApplicantsByJob(
            jobId,
            Number(page),
            Number(limit),
            search,
        );
    }
    @Get(':applicantId/match-jobs')
    @UseGuards(SanctumGuard)
    async findJobsByApplicant(
        @Param('applicantId', ParseIntPipe) applicantId: number,
        @Query('page') page = 1,
        @Query('limit') limit = 20,
    ) {

        return this.jobMatchService.findJobsByApplicant(
            applicantId,
            Number(page),
            Number(limit),
        );
    }
}
