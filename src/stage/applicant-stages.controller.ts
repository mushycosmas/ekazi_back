import {
    Controller,
    Post,
    Body,
    Req,
    UseGuards,
    Get,
    Param,
    ParseIntPipe,
    Query
} from '@nestjs/common';
import { ApplicantStagesService } from './applicant-stages.service';
import { BulkShortListDto } from './dto/bulk-shortlist.dto';
import { Users } from 'src/entities/users.entity';
import { SanctumGuard } from 'src/auth/guards/sanctum.guard';
import { BulkScreeningDto } from './dto/bulk-screning.dto';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';

@Controller('applicant-stages')
export class ApplicantStagesController {
    constructor(
        private readonly applicantStagesService:
            ApplicantStagesService
    ) { }

    @Get(':jobId/:stageName')
    @UseGuards(SanctumGuard)
    getApplicantsByStage(

        @Param('jobId', ParseIntPipe)
        jobId: number,
        @Param('stageName')
        stageName: string,
        @Query('page')
        page: number = 1,
        @Query('limit')
        limit: number = 10,
        @Query('search')
        search?: string,

    ) {

        return this.applicantStagesService.getApplicantsByStage(
            jobId,
            stageName,
            Number(page),
            Number(limit),
            search,
        );

    }

    @Post(':jobId/shortlist')
    @UseGuards(SanctumGuard)
    async bulkShortList(
        @CurrentUser() user: Users,
        @Param('jobId', ParseIntPipe)
        jobId: number,
        @Body() dto: BulkShortListDto,

    ) {

        await this.applicantStagesService.bulkShortList(
            jobId,
            dto,
            user
        );
        return {
            success: true,
            message:
                'Applicants processed successfully'
        };
    }
    @Post(':jobId/screening')
    @UseGuards(SanctumGuard)
    async screeningStage(
        @CurrentUser() user: Users,
        @Param('jobId', ParseIntPipe)
        jobId: number,
        @Body() dto: BulkScreeningDto,
    ) {
        return this.applicantStagesService.screeningStage(
            jobId,
            dto,
            user,
        );
    }
}