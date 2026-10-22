import {
  IsInt,
  IsNotEmpty,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateApplicantEmployerDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  employer_name: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  region_id: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  sub_location: string;
}