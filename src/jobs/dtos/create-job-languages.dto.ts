import { IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateJobLanguagesDto {
  @Type(() => Number)
  @IsNumber()
  job_id: number;

  @Type(() => Number)
  @IsNumber()
  language_id: number;

  @Type(() => Number)
  @IsNumber()
  read_id: number;

  @Type(() => Number)
  @IsNumber()
  write_id: number;

  @Type(() => Number)
  @IsNumber()
  speak_id: number;

  @Type(() => Number)
  @IsNumber()
  understand_id: number;
}