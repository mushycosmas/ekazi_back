import {
    IsArray,
    IsInt,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
} from 'class-validator';

export class SaveEvaluationResultDto {
    @IsInt()
    @IsNotEmpty()
    job_id: number;

    @IsInt()
    @IsNotEmpty()
    applicant_id: number;

    @IsArray()
    @IsInt({ each: true })
    evaluation_remark_id: number[];

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    comments?: string[];

    @IsOptional()
    @IsString()
    availability?: string;

    @IsOptional()
    @IsInt()
    number_days?: number;

    @IsOptional()
    @IsInt()
    relevant_experience?: number;

    @IsOptional()
    @IsNumber()
    salary_expectation?: number;

    @IsOptional()
    @IsString()
    recomandation?: string;

    @IsOptional()
    @IsInt()
    interview_action_id?: number;

    @IsOptional()
    @IsInt()
    summary_id?: number;

    @IsOptional()
    @IsInt()
    evaluation_action_id?: number;

    @IsOptional()
    @IsArray()
    @IsInt({ each: true })
    position_id?: number[];

    @IsOptional()
    @IsArray()
    benefit_id?: (number | string)[];

    @IsOptional()
    @IsNumber()
    rate?: number;

    @IsOptional()
    @IsInt()
    round_id?: number;
}