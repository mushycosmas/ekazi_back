import { IsNumber, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateJobReportTosDto {
  @Type(() => Number)
  @IsNumber()
  job_id: number;

  @IsOptional()
  @IsString()
  supervises?: string;

  @IsOptional()
  @IsString()
  interacts_with?: string;

  @IsOptional()
  @IsString()
  report_to?: string;
}