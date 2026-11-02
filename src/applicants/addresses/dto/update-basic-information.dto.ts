import {
    IsDateString,
    IsInt,
    IsNotEmpty,
    IsOptional,
    IsString,
    MaxLength,
    Min,
} from 'class-validator';

import { Type } from 'class-transformer';

export class UpdateBasicInformationDto {

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    marital_status_id?: number;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    gender_id?: number;

    @IsOptional()
    @IsString()
    @IsNotEmpty()
    first_name?: string;

    @IsOptional()
    @IsString()
    middle_name?: string | null;

    @IsOptional()
    @IsString()
    @IsNotEmpty()
    last_name?: string;

    @IsOptional()
    @IsDateString()
    dob?: string | null;

    @IsOptional()
    @IsString()
    @IsNotEmpty()
    phone?: string;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    region_id?: number;

    @IsOptional()
    @IsString()
    @MaxLength(100)
    sub_location?: string;

    @IsOptional()
    @IsString()
    postal?: string;
}