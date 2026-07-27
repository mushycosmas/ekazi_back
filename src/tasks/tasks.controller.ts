import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  Req,
  ParseIntPipe,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';

import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { Users } from 'src/entities/users.entity';
import { TaskQueryDto } from './dto/task-query.dto';
import { SanctumGuard } from 'src/auth/guards/sanctum.guard';
import { FilesInterceptor } from '@nestjs/platform-express';
import { multerConfig } from 'src/common/upload/multer.config';

@Controller('tasks')
export class TasksController {
  constructor(private readonly service: TasksService) { }

  @Post()
  @UseGuards(SanctumGuard)
  @UseInterceptors(
    FilesInterceptor(
      'attachments',
      10,
      multerConfig('tasks'),
    ),
  )
  createTask(
    @Req() req,
    @Body() dto: CreateTaskDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {

    return this.service.create(
      req.user,
      dto,
      files,
    );

  }

  @Get()
  @UseGuards(SanctumGuard)
  findAll(
    @CurrentUser() user: Users,
    @Query() query: TaskQueryDto,
  ) {
    return this.service.findAll(user.id, query);
  }

  @Get(':id')
  @UseGuards(SanctumGuard)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Put(':id')
  @UseGuards(SanctumGuard)
  updateTask(
    @CurrentUser() user: Users,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTaskDto,
  ) {
    return this.service.update(user.id, id, dto);
  }

  @Delete(':id')
  @UseGuards(SanctumGuard)
  removeTask(
    @CurrentUser() user: Users,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.service.remove(user.id, id);
  }
  // Assign task to user
  @Post(':id/assign')
  @UseGuards(SanctumGuard)
  assignTask(
    @Param('id', ParseIntPipe) taskId: number,
    @Body('user_id', ParseIntPipe) userId: number,
  ) {
    return this.service.assignTask(taskId, userId);
  }
}