import { Type } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateApplicantIndustryTagDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  industry_id: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  tag_name: string;
}