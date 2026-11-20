
import { Transform } from 'class-transformer';
import {
    Allow,
    IsInt,
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

function parseYear({ value }: { value: unknown }) {
    if (value === undefined || value === null || value === '') {
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

        return Number(trimmed);
    }

    return value;
}

export class CreateApplicantProficiencyDto {
    // Accept an existing organization ID OR a new organization name.
    @Transform(parseIdOrName)
    @Allow()
    organization_id: number | string;

    // Accept an existing proficiency ID OR a new proficiency name.
    @Transform(parseIdOrName)
    @Allow()
    proficiency_id: number | string;

    // Accept "2026" and convert it to integer 2026.
    @IsOptional()
    @Transform(parseYear)
    @IsInt()
    started?: number;

    // Accept "2027" and convert it to integer 2027.
    @IsOptional()
    @Transform(parseYear)
    @IsInt()
    ended?: number;

    @IsOptional()
    @IsString()
    @MaxLength(255)
    course?: string;

    @IsOptional()
    @IsString()
    @MaxLength(255)
    award?: string;
}
