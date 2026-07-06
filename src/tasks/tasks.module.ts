import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from './entities/tasks.entity';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { TaskAssignment } from './entities/task-assignments.entity';

@Module({
      imports: [TypeOrmModule.forFeature([
        Task,
        TaskAssignment,
    ])],
  controllers: [TasksController],
  providers: [TasksService],
  exports: [TasksService],
})
export class TasksModule {}
