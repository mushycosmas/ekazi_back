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


export class InterviewStageDto {


    // ============================
    // Job Information
    // ============================
    // ============================
    // Stage Information
    // ============================

    @Type(() => Number)
    @IsInt()
    stage_id: number;



    @Type(() => Number)
    @IsInt()
    @IsOptional()
    region_id?: number;



    // ============================
    // Applicants
    // ============================

    @IsArray()
    @ArrayNotEmpty()
    @Type(() => Number)
    @IsInt({ each: true })
    applicant_id: number[];



    // ============================
    // Interview Type
    // ============================

    @Type(() => Number)
    @IsInt()
    interview_type: number;



    // ============================
    // Internal Interview Panel
    // ============================

    @IsArray()
    @IsOptional()
    @Type(() => Number)
    @IsInt({ each: true })
    interviewer?: number[];



    // ============================
    // External Participants
    // ============================

    @IsArray()
    @IsOptional()
    @IsString({ each: true })
    interviewer_participant?: string[];



    // ============================
    // Interview Details
    // ============================

    @IsOptional()
    @IsString()
    position_name?: string;



    @IsOptional()
    @IsString()
    address?: string;



    @IsOptional()
    @IsString()
    message_body?: string;



    @IsOptional()
    @IsDateString()
    invite_date?: string;



    @IsOptional()
    @IsString()
    duration_test?: string;



    // ============================
    // Online Interview
    // ============================

    @IsOptional()
    @IsString()
    online_link?: string;

 


}