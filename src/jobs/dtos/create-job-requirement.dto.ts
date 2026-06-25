import { IsInt, IsOptional, IsString } from 'class-validator';

export class CreateJobRequirementDto {
  @IsOptional()
  @IsInt()
  job_id?: number;

  @IsString()
  main_duties: string;
}