import { IsOptional, IsString, IsNumber } from 'class-validator';

export class UpdateCompanyProfileDto {
    @IsOptional()
    @IsString()
    client_name?: string;

    @IsOptional()
    @IsString()
    additional_info?: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsNumber()
    country_id?: number;

    @IsOptional()
    @IsString()
    tin?: string;

    @IsOptional()
    @IsString()
    business?: string;

    @IsOptional()
    @IsNumber()
    type_id?: number;

    @IsOptional()
    @IsNumber()
    industry_id?: number;

    @IsOptional()
    @IsNumber()
    company_size_id?: number;

    @IsOptional()
    @IsString()
    founded_year?: Date;

    // ADDRESS
    @IsOptional()
    @IsNumber()
    region_id?: number;

    @IsOptional()
    @IsString()
    sub_location?: string;

    @IsOptional()
    @IsString()
    website?: string;

    @IsOptional()
    @IsString()
    location_notes?: string;

    @IsOptional()
    @IsString()
    extra_communication?: string;

    // CONTACT
    @IsOptional()
    @IsString()
    email?: string;

    @IsOptional()
    @IsString()
    phone?: string;

    @IsOptional()
    @IsString()
    fax?: string;

    @IsOptional()
    @IsString()
    attachment?: string


}