import {
    IsArray,
    IsInt,
    IsNotEmpty,
} from 'class-validator';

export class PreparedBulkInterviewDto {
    @IsArray()
    @IsInt({ each: true })
    @IsNotEmpty()
    applicant_id: number[];

    @IsArray()
    @IsInt({ each: true })
    @IsNotEmpty()
    criteria_id: number[];

    @IsInt()
    @IsNotEmpty()
    job_id: number;
}