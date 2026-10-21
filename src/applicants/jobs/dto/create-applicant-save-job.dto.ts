import { Type } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  Min,
} from 'class-validator';

export class CreateApplicantSaveJobDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsNotEmpty()
  job_id: number;
}