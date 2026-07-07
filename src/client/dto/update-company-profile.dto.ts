import { Type } from 'class-transformer';
import {
  IsOptional,
  IsString,
  IsNumber,
  IsDateString,
} from 'class-validator';

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
  @Type(() => Number)
  @IsNumber()
  country_id?: number;

  @IsOptional()
  @IsString()
  tin?: string;

  @IsOptional()
  @IsString()
  business?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  type_id?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  industry_id?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  company_size_id?: number;

  @IsOptional()
  @IsDateString()
  founded_year?: string;

  // ADDRESS
  @IsOptional()
  @Type(() => Number)
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
  attachment?: string;
}