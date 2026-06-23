import { IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateJobEducationDto {
  @Type(() => Number)
  @IsNumber()
  programme_category_id: number;

  @Type(() => Number)
  @IsNumber()
  course_id: number;

  @Type(() => Number)
  @IsNumber()
  education_level_id: number;

  @Type(() => Number)
  @IsNumber()
  major_id: number;

  @Type(() => Number)
  @IsNumber()
  job_id: number;
}