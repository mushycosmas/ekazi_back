 
import { Transform } from 'class-transformer';
import {
  Allow,
  IsDate,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

function parseIdOrName({ value }: { value: unknown }) {
  if (value === undefined || value === null) {
    return undefined;
  }

  if (typeof value === 'number') {
    return value;
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();

    if (!trimmed) {
      return undefined;
    }

    // Numeric strings represent existing database IDs.
    if (/^\d+$/.test(trimmed)) {
      return Number(trimmed);
    }

    // Other strings represent names.
    return trimmed;
  }

  return value;
}

function parseDate({ value }: { value: unknown }) {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  if (value instanceof Date) {
    return value;
  }

  if (typeof value === 'string') {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value : date;
  }

  return value;
}

export class CreateApplicantProficiencyDto {
  // Accept an existing organization ID OR a new organization name.
  // @Allow prevents whitelist errors for this mixed-type field.
  @Transform(parseIdOrName)
  @Allow()
  organization_id: number | string;

  // Accept an existing proficiency ID OR a new proficiency name.
  @Transform(parseIdOrName)
  @Allow()
  proficiency_id: number | string;

  @IsOptional()
  @Transform(parseDate)
  @IsDate()
  started?: Date;

  @IsOptional()
  @Transform(parseDate)
  @IsDate()
  ended?: Date;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  course?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  award?: string;
}
