import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    ParseIntPipe,
    Post,
    UseGuards,
    Logger,
    Query,
    BadRequestException,
    Req,
} from '@nestjs/common';

import { ApplicantJobsService } from
    './applicant-jobs.service';

import { CreateApplicantSaveJobDto } from './dto/create-applicant-save-job.dto';

import { SanctumGuard } from
    'src/auth/guards/sanctum.guard';

import { CurrentUser } from
    'src/auth/decorators/current-user.decorator';

import { Users } from 'src/entities/users.entity';
import { JobsService } from 'src/jobs/jobs.service';

@Controller()

export class ApplicantJobsController {
    private readonly logger = new Logger(ApplicantJobsController.name);
    constructor(
        private readonly applicantJobsService: ApplicantJobsService,
        private readonly JobsService: JobsService,
    ) { }

    @Post('applicant/saved-jobs')
    @UseGuards(SanctumGuard)
    async saveJob(
        @CurrentUser() user: Users,
        @Body() dto: CreateApplicantSaveJobDto,
    ) {
        this.logger.log(
            `Save job request received. User ID: ${user.id}, Job ID: ${dto.job_id}`,
        );

        try {
            const result = await this.applicantJobsService.saveJob(
                user.id,
                dto,
            );

            this.logger.log(
                `Job saved successfully. User ID: ${user.id}, Job ID: ${dto.job_id}`,
            );

            return result;
        } catch (error) {
            this.logger.error(
                `Failed to save job. User ID: ${user.id}, Job ID: ${dto.job_id}`,
                error instanceof Error ? error.stack : String(error),
            );

            throw error;
        }
    }

    @Get('applicant/saved-jobs')
    @UseGuards(SanctumGuard)
    async findAll(
        @CurrentUser() user: Users,
        @Query('page') page = '1',
        @Query('limit') limit = '20',
        @Query('search') search?: string,
    ) {
        return this.applicantJobsService.findAll(
            user.id,
            Number(page),
            Number(limit),
            search,
        );
    }

    @Get('applicant/saved-jobs/:jobId/check')
    @UseGuards(SanctumGuard)
    checkSavedJob(
        @CurrentUser() user: Users,
        @Param('jobId', ParseIntPipe) jobId: number,
    ) {
        return this.applicantJobsService.checkSavedJob(
            user.id,
            jobId,
        );
    }

    @Delete('applicant/saved-jobs/:jobId')
    @UseGuards(SanctumGuard)
    removeSavedJob(
        @CurrentUser() user: Users,
        @Param('jobId', ParseIntPipe) jobId: number,
    ) {
        return this.applicantJobsService.removeSavedJob(
            user.id,
            jobId,
        );
    }

    @Get('/jobs')
    findAllJobs(
        @Query('page') page?: string,
        @Query('limit') limit?: string,
        @Query('search') search?: string,
        @Query('industryId') industryId?: string,
        @Query('onlyActive') onlyActive?: string,
    ) {
        return this.JobsService.findAll(
            Number(page) || 1,
            Number(limit) || 20,
            search,
            industryId ? Number(industryId) : undefined,
            onlyActive === 'true',
        );
    }

    @Get('jobs/:id')
    @UseGuards(SanctumGuard)
    async myJobDetail(

        @Param('id', ParseIntPipe) id: number,
    ) {
        return this.JobsService.JobDetail(id);
    }

    @Get('applicant/my-application')
    @UseGuards(SanctumGuard)
    async myApplication(
        @CurrentUser() user: Users,
        @Query('page') page = '1',
        @Query('limit') limit = '20',
        @Query('search') search?: string,
    ) {
        
 

        return this.applicantJobsService.myApplication(
            user.id,
            Number(page),
            Number(limit),
            search,
        );
    }
    

}