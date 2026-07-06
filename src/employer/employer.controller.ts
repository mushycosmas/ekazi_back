import { Controller, Get, UseGuards, Req, Put, Body, Param, Query, ParseIntPipe, Post, Delete, UseInterceptors, UploadedFile } from '@nestjs/common';
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


@Controller('employer')
export class EmployerController {
  constructor(
    private readonly employerService: EmployerService,
    private readonly tasksService: TasksService
  ) { }

  @UseGuards(SanctumGuard)
  @Get('account')
  employerAccount(@CurrentUser() user: Users) {
    return this.employerService.employerAccount(user);
  }

  @Get('company-profile')
  @UseGuards(SanctumGuard)
  getCompanyProfile(@Req() req: any) {
    return this.employerService.getCompanyProfile(req.user);
  }

  // =========================
  // UPDATE COMPANY PROFILE
  // =========================
  // @UseGuards(SanctumGuard)
  // @Put('company-profile')
  // updateCompanyProfile(
  //   @Req() req,
  //   @Body() dto: UpdateCompanyProfileDto,
  // ) {
  //   return this.employerService.updateCompanyProfile(req.user, dto);
  // }
  @UseGuards(SanctumGuard)
  @Put('company-profile')
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
  @Get('jobs/:jobId/applications-by-stage')
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

}


