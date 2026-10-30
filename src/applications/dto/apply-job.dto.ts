import {
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class ApplyJobDto {
  @IsString()
  @MaxLength(5000)
  notes: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  cvPath?: string;
}