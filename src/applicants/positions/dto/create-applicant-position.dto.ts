 import { Transform } from 'class-transformer';
import {
  Allow,
  IsDate,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateIf,
} from 'class-validator';

/* ------------------------------------------------------------------ */
/*  Transform helpers                                                  */
/* ------------------------------------------------------------------ */

/**
 * Empty string / null / undefined -> undefined
 * (so @IsOptional() can short-circuit validation)
 */
const emptyToUndefined = ({ value }: { value: unknown }) =>
  value === '' || value === null || value === undefined ? undefined : value;

/**
 * Accepts either a numeric id ("123", 123) or a name ("AC Body").
 * - Numeric string -> number
 * - Non-numeric string -> trimmed string
 * - Empty string -> undefined
 */
const parseIdOrName = ({ value }: { value: unknown }) => {
  if (value === null || value === undefined) return undefined;
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const v = value.trim();
    if (!v) return undefined;
    return /^\d+$/.test(v) ? Number(v) : v;
  }
  return value;
};

/**
 * Convert to number. Leaves null/undefined/'' as undefined so
 * @IsOptional() can skip validation.
 */
const parseNumber = ({ value }: { value: unknown }) => {
  if (value === null || value === undefined || value === '') return undefined;
  const n = Number(value);
  return Number.isNaN(n) ? value : n;
};

/**
 * Convert to Date. Leaves null/undefined/'' as undefined.
 */
const parseDate = ({ value }: { value: unknown }) => {
  if (value === null || value === undefined || value === '') return undefined;
  if (value instanceof Date) return value;
  const d = new Date(value as string);
  return Number.isNaN(d.getTime()) ? value : d;
};

/* ------------------------------------------------------------------ */
/*  DTO                                                                */
/* ------------------------------------------------------------------ */

export class CreateApplicantPositionDto {
  /**
   * Either an existing position id (number / numeric string) OR
   * a new position name (string). Kept unvalidated on purpose.
   */
  @Transform(parseIdOrName)
  @Allow()
  position_id: number | string;

  /**
   * Either an existing employer id OR a new employer name.
   */
  @Transform(parseIdOrName)
  @Allow()
  applicant_employer_id: number | string;

  @Transform(parseNumber)
  @IsInt()
  @Min(1)
  industry_id: number;

  @Transform(parseNumber)
  @IsInt()
  @Min(1)
  position_level_id: number;

  @IsOptional()
  @Transform(parseNumber)
  @IsInt()
  @Min(1)
  salary_id?: number | null;

  @Transform(parseNumber)
  @IsInt()
  @Min(1)
  start_salary_id: number;

  @Transform(parseNumber)
  @IsInt()
  @Min(1)
  end_salary_id: number;

  @Transform(emptyToUndefined)
  @IsString()
  @MaxLength(100)
  responsibility: string;

  @Transform(emptyToUndefined)
  @IsString()
  @MaxLength(200)
  remark: string;

  @Transform(parseDate)
  @IsDate()
  start_date: Date;

  @IsOptional()
  @Transform(parseDate)
  @IsDate()
  end_date?: Date | null;

  @Transform(parseNumber)
  @IsInt()
  @Min(1)
  region_id: number;

  @Transform(emptyToUndefined)
  @IsString()
  @MaxLength(100)
  sub_location: string;
}