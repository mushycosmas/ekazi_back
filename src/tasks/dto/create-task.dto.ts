import {
  IsString,
  IsOptional,
  IsEnum,
  IsDateString,
  MaxLength,
  IsArray,
  IsNumber,
} from 'class-validator';

import { Type } from 'class-transformer';

import { TaskPriority, TaskStatus } from '../entities/tasks.entity';


export class CreateTaskDto {

  @IsString()
  @MaxLength(255)
  title: string;


  @IsOptional()
  @IsString()
  description?: string;


  @IsOptional()
  @IsDateString()
  deadline?: Date;


  @IsOptional()
  @IsEnum(TaskPriority)
  priority?: TaskPriority;


  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;


  @IsOptional()
  @IsArray()
  @Type(() => Number)
  @IsNumber({}, { each: true })
  assignees: number[];

}