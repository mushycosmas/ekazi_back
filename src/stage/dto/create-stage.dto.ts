import {
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateStageDto {
  @IsOptional()
  @IsInt()
  stage_number?: number;

  @IsString()
  @MaxLength(50)
  stage_code: string;

  @IsString()
  @MaxLength(100)
  stage_name: string;

  @IsOptional()
  hide?: boolean;
}