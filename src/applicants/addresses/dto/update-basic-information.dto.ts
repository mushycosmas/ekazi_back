import {
    IsArray,
    IsDateString,
    IsInt,
    IsNotEmpty,
    IsOptional,
    IsString,
    MaxLength,
    ValidateNested,
    Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateBasicPhoneDto {
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    id?: number;

    @IsString()
    @IsNotEmpty()
    phone_number: string;
}

export class UpdateBasicAddressDto {
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    id?: number;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    region_id?: number;

    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    sub_location: string;

    @IsOptional()
    @IsString()
    postal?: string;
}

export class UpdateBasicInformationDto {
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
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => UpdateBasicPhoneDto)
    phone?: UpdateBasicPhoneDto[];

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => UpdateBasicAddressDto)
    addresses?: UpdateBasicAddressDto[];
}