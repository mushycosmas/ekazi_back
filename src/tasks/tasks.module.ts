import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from './entities/tasks.entity';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { TaskAssignment } from './entities/task-assignments.entity';
import { Users } from 'src/entities/users.entity';
import { PersonalAccessToken } from 'src/entities/personal-access-token.entity';

@Module({
      imports: [TypeOrmModule.forFeature([
        Task,
        TaskAssignment,
        Users,
        PersonalAccessToken,
    ])],
  controllers: [TasksController],
  providers: [TasksService],
  exports: [TasksService],
})
export class TasksModule {}
