import {
    IsArray,
    IsDateString,
    IsInt,
    IsNotEmpty,
    IsOptional,
    IsString,
    ArrayNotEmpty,
} from 'class-validator';

import { Type } from 'class-transformer';


export class BackgroundChecktageDto {

    // ============================
    // Stage Information
    // ============================

    @Type(() => Number)
    @IsInt()
    stage_id: number;

    // ============================
    // Applicants
    // ============================

    @IsArray()
    @ArrayNotEmpty()
    @Type(() => Number)
    @IsInt({ each: true })
    applicant_id: number[];

    @IsOptional()
    @IsString()
    message_body?: string;
 
 
}