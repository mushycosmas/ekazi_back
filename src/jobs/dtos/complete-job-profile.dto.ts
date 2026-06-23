import {
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CompleteJobProfileDto {
  @Type(() => Number)
  @IsNumber()
  gender_id: number;

  @IsOptional()
  @IsString()
  years_experience?: string;

  @Type(() => Number)
  @IsNumber()
  applicant_min_age: number;

  @Type(() => Number)
  @IsNumber()
  applicant_max_age: number;

  @IsOptional()
  @IsArray()
  culture_ids?: number[];

  @IsOptional()
  @IsArray()
  personality_ids?: number[];

  @IsOptional()
  @IsArray()
  software_ids?: number[];

  @IsOptional()
  @IsArray()
  tool_ids?: number[];

  @IsOptional()
  @IsArray()
  knowledge_ids?: number[];

  @IsOptional()
  @IsArray()
  proficiency_ids?: number[];
}