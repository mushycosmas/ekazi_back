
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

export class CreateApplicantProficiencyDto {
    // Accept an existing organization ID OR a new organization name.
    @Transform(parseIdOrName)
    @Allow()
    organization_id: number | string;

    // Accept an existing proficiency ID OR a new proficiency name.
    @Transform(parseIdOrName)
    @Allow()
    proficiency_id: number | string;

    // Year only, e.g. 2026
    @IsOptional()
    @IsInt()
    started?: number;

    // Year only, e.g. 2027
    @IsOptional()
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
