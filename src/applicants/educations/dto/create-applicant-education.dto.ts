 import { Transform, Type } from 'class-transformer';
import {
  IsDate,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

const emptyToUndefined = ({ value }: { value: unknown }) => {
  if (value === '' || value === null || value === undefined) {
    return undefined;
  }
  return value;
};

const parseIdOrName = ({ value }: { value: unknown }) => {
  if (value === '' || value === null || value === undefined) {
    return undefined;
  }

  if (typeof value === 'string' && /^\d+$/.test(value.trim())) {
    return Number(value.trim());
  }

  return value;
};

export class CreateApplicantEducationDto {
  @Transform(emptyToUndefined)
  @Type(() => Number)
  @IsInt()
  @Min(1)
  education_level_id: number;

  // Existing college ID or new college name
  @Transform(parseIdOrName)
  @IsOptional()
  college_id?: number | string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  college_name?: string;

  // Optional metadata when registering a new college
  @Transform(emptyToUndefined)
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  college_region_id?: number;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  college_town?: string;

  @IsOptional()
  @IsString()
  @MaxLength(45)
  college_reg?: string;

  @IsOptional()
  @IsString()
  @MaxLength(256)
  college_status?: string;

  // Existing course ID or new course name
  @Transform(parseIdOrName)
  @IsOptional()
  course_id?: number | string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  course_name?: string;

  @Transform(emptyToUndefined)
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  programme_category_id?: number;

  // Existing major ID or new major name
  @Transform(parseIdOrName)
  @IsOptional()
  major_id?: number | string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  major_name?: string;

  @Transform(emptyToUndefined)
  @Type(() => Date)
  @IsDate()
  started: Date;

  @Transform(emptyToUndefined)
  @Type(() => Date)
  @IsDate()
  ended: Date;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  name?: string;

  // Set by the controller after the file has been uploaded.
  @IsOptional()
  @IsString()
  attachment?: string;
}