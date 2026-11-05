 import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ApplyJobDto {
  @Type(() => Number)
  @IsInt()
  @IsNotEmpty()
  jobId: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(5000)
  notes: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  cvPath?: string;
}