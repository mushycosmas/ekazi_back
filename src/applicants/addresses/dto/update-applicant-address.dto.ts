 import { PartialType } from '@nestjs/mapped-types';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

import { CreateApplicantAddressDto } from './create-applicant-address.dto';

export class UpdateApplicantAddressDto extends PartialType(
  CreateApplicantAddressDto,
) {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  first_name?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  middle_name?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  last_name?: string | null;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  gender_id?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  marital_id?: number;

  @IsOptional()
  @IsDateString()
  dob?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  nationality_id?: number;
}