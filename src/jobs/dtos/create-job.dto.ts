import {
  IsString,
  IsNumber,
  IsOptional,
  IsBoolean,
  IsNotEmpty,
  MaxLength,
  IsInt

} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateJobDto {
  @IsNumber()
  client_id: number;

  @IsNumber()
  category_id: number;

  @IsNumber()
  country_id: number;

  @IsNumber()
  creator_id: number;

  @IsNumber()
  updator_id: number;

  @IsNumber()
  type_id: number;

  @IsNumber()
  stage_id: number;

  @IsOptional()
  position_id: any;

  @IsNumber()
  position_level_id: number;

  @IsString()
  @IsOptional()
  @MaxLength(300)
  title: string;

  @IsString()
  @IsOptional()
  duty: string;

  @IsString()
  @IsOptional()
  status: string;

  @IsString()
  @IsNotEmpty()
  dead_line: string;

  @IsOptional()
  @IsBoolean()
  featured?: boolean;

  @IsOptional()
  @IsBoolean()
  hide?: boolean;

  @IsOptional()
  @IsNumber()
  industry_id?: number;

  @IsOptional()
  @IsNumber()
  region_id?: number;

  @IsOptional()
  @IsNumber()
  gender_id?: number;

  @IsOptional()
  @IsNumber()
  currency_id?: number;

  @IsOptional()
  @IsNumber()
  quantity?: number;


  @IsOptional()
  @IsString()
  sub_location?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  from_salary?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  to_salary?: number;
}