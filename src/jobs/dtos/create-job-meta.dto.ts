import { IsNumber, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateJobMetaDto {
    @Type(() => Number)
    @IsNumber()
    job_id: number;

    @Type(() => Number)
    @IsNumber()
    meta_keyword_id: number;

  
}