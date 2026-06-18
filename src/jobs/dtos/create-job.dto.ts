import {
  IsString,
  IsOptional,
  IsNumber,
} from 'class-validator';

export class CreateJobDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  client_id?: number;
}