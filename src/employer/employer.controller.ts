import { Controller, Get, UseGuards, Req, Put, Body, Param, Query, ParseIntPipe, Post, Delete, UseInterceptors, UploadedFile, NotFoundException } from '@nestjs/common';
import { SanctumGuard } from 'src/auth/guards/sanctum.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { EmployerService } from './employer.service';
import { Users } from 'src/entities/users.entity';
import { UpdateCompanyProfileDto } from 'src/client/dto/update-company-profile.dto';
import { TasksService } from 'src/tasks/tasks.service';
import { CreateTaskDto } from 'src/tasks/dto/create-task.dto';
import { UpdateTaskDto } from 'src/tasks/dto/update-task.dto';
import { TaskQueryDto } from 'src/tasks/dto/task-query.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerConfig } from 'src/common/upload/multer.config';
import { CvbuilderService } from 'src/cvbuilder/cvbuilder.service';
import { ApplicantStagesService } from 'src/stage/applicant-stages.service';
import { BulkShortListDto } from 'src/stage/dto/bulk-shortlist.dto';
import { BulkScreeningDto } from 'src/stage/dto/bulk-screning.dto';
import { InterviewStageDto } from 'src/stage/dto/bulk-interview.dto';
import { SelectionStageDto } from 'src/stage/dto/bulk-selection.dto';
import { BackgroundChecktageDto } from 'src/stage/dto/bulk-background-check.dto';
import { OfferDto } from 'src/stage/dto/bulk-offer.dto';
import { EmployedDto } from 'src/stage/dto/employed.dto';


@Controller('employer')
export class EmployerController {
  constructor(
    private readonly employerService: EmployerService,
    private readonly tasksService: TasksService,
    private readonly cvbuilderService: CvbuilderService,
    private readonly applicantStagesService: ApplicantStagesService
  ) { }

  @UseGuards(SanctumGuard)
  @Get('account')
  employerAccount(@CurrentUser() user: Users) {
    return this.employerService.employerAccount(user);
  }
  //company-profile
  @Get()
  @UseGuards(SanctumGuard)
  getCompanyProfile(@Req() req: any) {
    return this.employerService.getCompanyProfile(req.user);
  }

  @Put()
  @UseGuards(SanctumGuard)
  @UseInterceptors(
    FileInterceptor(
      'attachment',
      multerConfig('company/descriptions'),
    ),
  )
  updateCompanyProfile(
    @Req() req,
    @Body() dto: UpdateCompanyProfileDto,
    @UploadedFile() file: any,
  ) {
    return this.employerService.updateCompanyProfile(
      req.user,
      dto,
      file,
    );
  }

  @Get('jobs/:jobId/applications')
  @UseGuards(SanctumGuard)
  getApplicants(
    @Req() req,
    @Param('jobId', ParseIntPipe) jobId: number,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Query('search') search?: string,
    @Query('stage_id') stageId?: number,
  ) {
    return this.employerService.getApplicantsByJob(
      req.user,
      jobId,
      Number(page),
      Number(limit),
      search,
      stageId ? Number(stageId) : undefined,
    );
  }
  @Get(':jobId/applications')
  @UseGuards(SanctumGuard)
  getByStage(
    @Req() req,
    @Param('jobId', ParseIntPipe) jobId: number,
    @Query('stage') stage?: number,
    @Query('search') search?: string,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    return this.employerService.getJobStageHistory(req.user,
      jobId,
      Number(page),
      Number(limit),
      search,
      stage ? Number(stage) : undefined);
  }
  @Get('tasks')
  @UseGuards(SanctumGuard)
  getTasks(
    @CurrentUser() user: Users,
    @Query() query: TaskQueryDto,
  ) {
    return this.tasksService.findAll(user.id, query);
  }

  @Post('tasks')
  @UseGuards(SanctumGuard)
  create(
    @CurrentUser() user: Users,
    @Body() dto: CreateTaskDto,
  ) {
    return this.tasksService.create(user, dto);
  }
  @Put('tasks/:id')
  @UseGuards(SanctumGuard)
  updateTask(
    @CurrentUser() user: Users,
    @Param('id') id: number,
    @Body() dto: UpdateTaskDto,
  ) {
    return this.tasksService.update(user.id, Number(id), dto);
  }

  @Delete('tasks/:id')
  @UseGuards(SanctumGuard)
  removeTask(
    @CurrentUser() user: Users,
    @Param('id') id: number,
  ) {
    return this.tasksService.remove(user.id, Number(id));
  }

  @Post('task-assignments')
  @UseGuards(SanctumGuard)
  assignTask(
    @Body('task_id') taskId: number,
    @Body('user_id') userId: number,
  ) {
    return this.tasksService.assignTask(Number(taskId), Number(userId));
  }



  // Endpoint to get applicant CV
  @Get('applicant/:id')
  @UseGuards(SanctumGuard)
  async getApplicantCv(@Param('id') id: string) {
    const applicant = await this.cvbuilderService.getApplicantCv(+id);
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



  @Get('jobs/:jobId/application-stages/:stageName')
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
  @Post('jobs/:jobId/application-stages/shortlist')
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
  @Post('jobs/:jobId/application-stages/screening')
  @UseGuards(SanctumGuard)
  async screeningStage(
    @CurrentUser() user: Users,
    @Param('jobId', ParseIntPipe)
    jobId: number,
    @Body() dto: BulkScreeningDto,

  ) {

    await this.applicantStagesService.screeningStage(
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
  @Post('jobs/:jobId/application-stages/interview')
  @UseGuards(SanctumGuard)
  async interviewStage(
    @CurrentUser() user: Users,
    @Param('jobId', ParseIntPipe)
    jobId: number,
    @Body() dto: InterviewStageDto,

  ) {

    await this.applicantStagesService.interiewStage(
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

  @Post('jobs/:jobId/application-stages/selection')
  @UseGuards(SanctumGuard)
  async selectionStage(
    @CurrentUser() user: Users,
    @Param('jobId', ParseIntPipe)
    jobId: number,
    @Body() dto: SelectionStageDto,

  ) {

    await this.applicantStagesService.selectionStages(
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

  @Post('jobs/:jobId/application-stages/background-check')
  @UseGuards(SanctumGuard)
  async backgroundCheckStage(
    @CurrentUser() user: Users,
    @Param('jobId', ParseIntPipe)
    jobId: number,
    @Body() dto: BackgroundChecktageDto,

  ) {

    await this.applicantStagesService.BackgrounCheckStages(
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
  @Post('jobs/:jobId/application-stages/offer')
  @UseGuards(SanctumGuard)
  async offerStage(
    @CurrentUser() user: Users,
    @Param('jobId', ParseIntPipe)
    jobId: number,
    @Body() dto: OfferDto,

  ) {

    await this.applicantStagesService.OfferStages(
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
    @Post('jobs/:jobId/application-stages/employed')
  @UseGuards(SanctumGuard)
  async employedStage(
    @CurrentUser() user: Users,
    @Param('jobId', ParseIntPipe)
    jobId: number,
    @Body() dto: EmployedDto,

  ) {

    await this.applicantStagesService.EmployedStages(
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

}


