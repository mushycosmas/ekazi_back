import {
    IsArray,
    IsInt,
    IsNotEmpty,
} from 'class-validator';

export class PreparedInterviewDto {
    @IsArray()
    @IsInt({ each: true })
    @IsNotEmpty()
    criteria_id: number[];

    @IsInt()
    @IsNotEmpty()
    job_id: number;

    @IsInt()
    @IsNotEmpty()
    applicant_id: number;
}