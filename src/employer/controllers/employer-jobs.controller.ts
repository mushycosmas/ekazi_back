import { Controller, Get, UseGuards, Query, Req, Param, ParseIntPipe, Post, Body, Put, Delete } from '@nestjs/common';
import { EmployerJobsService } from '../services/employer-jobs.service';
import { SanctumGuard } from 'src/auth/guards/sanctum.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { Users } from 'src/entities/users.entity';
import { JobsService } from 'src/jobs/jobs.service';
import { CreateJobDto } from 'src/jobs/dtos/create-job.dto';
import { UpdateJobDto } from 'src/jobs/dtos/update-job.dto';
import { JobMetaService } from 'src/jobs/services/job-meta.service';
import { CreateJobMetaDto } from 'src/jobs/dtos/create-job-meta.dto';
import { UpdateJobMetaDto } from 'src/jobs/dtos/update-job-meta.dto';
import { UpdateJobReportTosDto } from 'src/jobs/dtos/update-job-report-tos.dto';
import { JobReportTosService } from 'src/jobs/services/job-report-tos.service';
import { CreateJobReportTosDto } from 'src/jobs/dtos/create-job-report-tos.dto';
import { JobEducationService } from 'src/jobs/services/job-education.service';
import { CreateJobEducationDto } from 'src/jobs/dtos/create-job-education.dto';
import { UpdateJobEducationDto } from 'src/jobs/dtos/update-job-education.dto';
import { JobLanguagesService } from 'src/jobs/services/job-languages.service';
import { UpdateJobLanguagesDto } from 'src/jobs/dtos/update-job-languages.dto';
import { CreateJobLanguagesDto } from 'src/jobs/dtos/create-job-languages.dto';
import { JobRequirementsService } from 'src/jobs/services/job-requirements.service';
import { UpdateJobRequirementDto } from 'src/jobs/dtos/update-job-requirement.dto';
import { CreateJobRequirementDto } from 'src/jobs/dtos/create-job-requirement.dto';
import { JobOtherRequirementsService } from 'src/jobs/services/job-other-requirements.service';
import { CreateJobOtherRequirementDto } from 'src/jobs/dtos/create-job-other-requirement.dto';
import { UpdateJobOtherRequirementDto } from 'src/jobs/dtos/update-job-other-requirement.dto';
import { CompleteJobProfileDto } from 'src/jobs/dtos/complete-job-profile.dto';
import { JobSettingsService } from 'src/jobs/services/job-settings.service';
import { UpdateJobSettingsDto } from 'src/jobs/dtos/update-job-settings.dto';

@Controller('employer')
export class EmployerJobsController {
    constructor(
        private readonly employerJobsService: EmployerJobsService,
        private readonly jobService: JobsService,
        private readonly jobMetasService: JobMetaService,
        private readonly service: JobReportTosService,
        private readonly jobEducationService: JobEducationService,
        private readonly jobLnagugaeService: JobLanguagesService,
        private readonly jobRequirementsService: JobRequirementsService,
        private readonly otherRequiremnetservice: JobOtherRequirementsService,
        private readonly jobSettingsService: JobSettingsService,
    
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
    @Get('jobs/:id')
    @UseGuards(SanctumGuard)
    async myJobDetail(
        @Req() req,
        @Param('id', ParseIntPipe) id: number,
    ) {
        return this.employerJobsService.myJobDetail(req.user, id);
    }

    @Post('jobs')
    @UseGuards(SanctumGuard)
    create(
        @CurrentUser() user: Users,
        @Body() createJobDto: CreateJobDto,
    ) {
        console.log('USER:', user);
        console.log('BODY:', createJobDto);
        return this.jobService.create(
            user,
            createJobDto,
        );
    }

    @Put('jobs/:id')
    @UseGuards(SanctumGuard)
    update(
        @Param('id', ParseIntPipe) id: number,

        @CurrentUser() user: Users,

        @Body() updateJobDto: UpdateJobDto,
    ) {

        return this.jobService.update(
            id,
            updateJobDto,
            user,
        );

    }


    @Delete('jobs/:id')
    @UseGuards(SanctumGuard)
    removejob(
        @CurrentUser() user: Users,
        @Param('id') id: Number,
    ) {
        return this.jobService.remove(
            user,
            Number(id),

        );
    }

    @Put('jobs/:id/restore')
    @UseGuards(SanctumGuard)
    restoreJob(
        @CurrentUser() user: Users,
        @Param('id') id: string,
    ) {
        return this.jobService.restore(
            user,
            Number(id),
        );
    }
    @Put('jobs/:id/publish')
    @UseGuards(SanctumGuard)
    togglePublish(
        @CurrentUser() user: Users,
        @Param('id') id: string,
    ) {

        return this.jobService.togglePublish(
            user,
            Number(id),
        );
    }


    @Post('job-metas')
    @UseGuards(SanctumGuard)
    createJobMeta(
        @CurrentUser() user: Users,
        @Body() createDto: CreateJobMetaDto,
    ) {

        return this.jobMetasService.create(
            user,
            createDto,
        );
    }

    @Get('job-metas')
    @UseGuards(SanctumGuard)
    findAll(
        @CurrentUser() user: Users,
    ) {

        return this.jobMetasService.findAll(
            user,
        );
    }

    @Get('job-metas/:id')
    @UseGuards(SanctumGuard)
    findOne(
        @CurrentUser() user: Users,
        @Param('id', ParseIntPipe) id: number,
    ) {

        return this.jobMetasService.findOne(
            user,
            id,
        );
    }

    @Put('job-metas/:id')
    @UseGuards(SanctumGuard)
    updateJobMeta(
        @CurrentUser() user: Users,

        @Param('id', ParseIntPipe) id: number,

        @Body() updateDto: UpdateJobMetaDto,
    ) {

        return this.jobMetasService.update(
            user,
            id,
            updateDto,
        );
    }

    @Delete('job-metas/:id')
    @UseGuards(SanctumGuard)
    removeJoReportTo(
        @CurrentUser() user: Users,

        @Param('id', ParseIntPipe) id: number,
    ) {

        return this.jobMetasService.remove(
            user,
            id,
        );
    }

    @Post('job-report-tos')
    @UseGuards(SanctumGuard)
    createJobReportTo(
        @CurrentUser() user: Users,
        @Body() dto: CreateJobReportTosDto,
    ) {
        return this.service.create(user, dto);
    }

    @Get('job-report-tos')
    @UseGuards(SanctumGuard)
    findAllJobReportTo(
        @CurrentUser() user: Users,
    ) {
        return this.service.findAll(user);
    }

    @Get('job-report-tos/:id')
    @UseGuards(SanctumGuard)
    findOneJobReportTo(
        @CurrentUser() user: Users,
        @Param('id', ParseIntPipe) id: number,
    ) {
        return this.service.findOne(user, id);
    }

    @Put('job-report-tos/:id')
    @UseGuards(SanctumGuard)
    updateJobReportTo(
        @CurrentUser() user: Users,
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateJobReportTosDto,
    ) {
        return this.service.update(
            user,
            id,
            dto,
        );
    }

    @Delete('job-report-tos/:id')
    @UseGuards(SanctumGuard)
    remove(
        @CurrentUser() user: Users,
        @Param('id', ParseIntPipe) id: number,
    ) {
        return this.service.remove(
            user,
            id,
        );
    }

    @Post('job-educations')
    @UseGuards(SanctumGuard)
    createjobeducation(
        @Body() dto: CreateJobEducationDto
    ) {

        return this.jobEducationService.create(
            dto
        );
    }


    @Get('job-educations')
    @UseGuards(SanctumGuard)
    findAllJobEducation(
        @Req() req: Request
    ) {

        return this.jobEducationService.findAll(
        );
    }

    @Get('job-educations/:id')
    @UseGuards(SanctumGuard)
    findOneJobEducation(
        @Param('id') id: number
    ) {
        return this.jobEducationService.findOne(
            Number(id)
        );
    }


    @Put('job-educations/:id')
    @UseGuards(SanctumGuard)
    updateJobeducation(
        @Param('id') id: number,
        @Body() dto: UpdateJobEducationDto
    ) {

        return this.jobEducationService.update(
            Number(id),
            dto
        );
    }


    @Delete('job-educations/:id')
    @UseGuards(SanctumGuard)
    removeJobeducation(
        @Param('id') id: number
    ) {

        return this.jobEducationService.remove(

            Number(id)
        );
    }

    @Post('job-languages')
    @UseGuards(SanctumGuard)
    createJoblanguge(@Body() dto: CreateJobLanguagesDto) {
        return this.jobLnagugaeService.create(dto);
    }

    @Get('job-languages')
    @UseGuards(SanctumGuard)
    findAllJobLanguage() {
        return this.jobLnagugaeService.findAll();
    }

    @Get('job-languages/:id')
    @UseGuards(SanctumGuard)
    findOneJoblanguage(@Param('id') id: number) {
        return this.jobLnagugaeService.findOne(Number(id));
    }

    @Put('job-languages/:id')
    @UseGuards(SanctumGuard)
    updateJobLnaguge(@Param('id') id: number, @Body() dto: UpdateJobLanguagesDto) {
        return this.jobLnagugaeService.update(Number(id), dto);
    }

    @Delete('job-languages/:id')
    @UseGuards(SanctumGuard)
    removeJobLanguage(@Param('id') id: number) {
        return this.jobLnagugaeService.remove(Number(id));
    }

    //JOB REQUIRMENTS


    @Post('job-requirements')
    @UseGuards(SanctumGuard)
    createJobRequirements(
        @Body()
        createDto: CreateJobRequirementDto,
    ) {
        return this.jobRequirementsService.create(
            createDto,
        );
    }

    @Get('job-requirements')
    @UseGuards(SanctumGuard)
    findAllJobRequirements() {
        return this.jobRequirementsService.findAll();
    }

    @Get('job-requirements/:id')
    @UseGuards(SanctumGuard)
    findOneJobRequirements(
        @Param('id', ParseIntPipe)
        id: number,
    ) {
        return this.jobRequirementsService.findOne(id);
    }

    @Put('job-requirements/:id')
    @UseGuards(SanctumGuard)
    updateJobRequirements(
        @Param('id', ParseIntPipe)
        id: number,
        @Body()
        updateDto: UpdateJobRequirementDto,
    ) {
        return this.jobRequirementsService.update(
            id,
            updateDto,
        );
    }

    @Delete('job-requirements/:id')
    @UseGuards(SanctumGuard)
    removJobRequirementse(
        @Param('id', ParseIntPipe)
        id: number,
    ) {
        return this.jobRequirementsService.remove(id);
    }


    @Post('job-other-requirements')
    @UseGuards(SanctumGuard)
    createJObOtherRequiremnets(
        @Body()
        createDto: CreateJobOtherRequirementDto,
    ) {
        return this.otherRequiremnetservice.create(createDto);
    }

    @Get()
    @UseGuards(SanctumGuard)
    findAllJObOtherRequiremnets() {
        return this.otherRequiremnetservice.findAll();
    }

    @Get('job-other-requirements/:id')
    @UseGuards(SanctumGuard)
    findOneJObOtherRequiremnets(
        @Param('id', ParseIntPipe)
        id: number,
    ) {
        return this.otherRequiremnetservice.findOne(id);
    }

    @Put('job-other-requirements/:id')
    @UseGuards(SanctumGuard)
    updateJObOtherRequiremnets(
        @Param('id', ParseIntPipe)
        id: number,
        @Body()
        updateDto: UpdateJobOtherRequirementDto,
    ) {
        return this.otherRequiremnetservice.update(id, updateDto);
    }

    @Delete('job-other-requirements/:id')
    @UseGuards(SanctumGuard)
    removeJObOtherRequiremnets(
        @Param('id', ParseIntPipe)
        id: number,
    ) {
        return this.otherRequiremnetservice.remove(id);
    }

    @Put('complete-profile/:id')
    @UseGuards(SanctumGuard)
    updateCompleteProfile(
        @CurrentUser() user: Users,
        @Param('id') id: number,
        @Body() dto: CompleteJobProfileDto,
    ) {
        return this.jobService.completeProfile(
            user,
            Number(id),
            dto,
        );
    }

  
    
      @Put('job-settings/:id')
      @UseGuards(SanctumGuard)
      updateSettings(
        @Param('id') id: string,
        @Body() dto: UpdateJobSettingsDto,
      ) {
        return this.jobSettingsService.updateSettings(
          Number(id),
          dto,
        );
      }
}
