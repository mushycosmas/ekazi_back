import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsDateString,
  ArrayNotEmpty,
} from 'class-validator';

import { Type } from 'class-transformer';

export class BulkScreeningDto {
//   @Type(() => Number)
//   @IsInt()
//   job_id: number;

  @Type(() => Number)
  @IsInt()
  stage_id: number;

  @Type(() => Number)
  @IsInt()
  @IsOptional()
  region_id?: number;

  @IsArray()
  @ArrayNotEmpty()
  @Type(() => Number)
  @IsInt({ each: true })
  applicant_id: number[];

  @IsOptional()
  @IsString()
  position_name?: string;

  @IsOptional()
  @IsString()
  stage_name?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  message_body?: string;

  @IsOptional()
  @IsDateString()
  invite_date?: string;

  // Aptitude Test Information

  @IsOptional()
  @IsDateString()
  test_date?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  test_duration?: number;

  @IsOptional()
  @IsDateString()
  test_deadline?: string;

  @IsOptional()
  @IsString()
  test_link?: string;

  @IsOptional()
  @IsString()
  user_name?: string;

  @IsOptional()
  @IsString()
  user_password?: string;
}