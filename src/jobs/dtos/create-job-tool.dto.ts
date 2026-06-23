import { IsNumber, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateJobToolDto {
  @Type(() => Number)
  @IsNumber()
  job_id: number;

  @Type(() => Number)
  @IsNumber()
  tool_id: number;

  @Type(() => Number)
  @IsNumber()
  user_id: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  hide?: number;
}