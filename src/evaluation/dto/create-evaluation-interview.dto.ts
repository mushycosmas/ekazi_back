 import {
    IsArray,
    IsInt,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class EvaluationScoreDto {
    @IsInt()
    @IsNotEmpty()
    evaluation_id: number;

    @IsNumber()
    @IsNotEmpty()
    total_score: number;
}

export class CreateEvaluationInterviewDto {
    @IsInt()
    @IsNotEmpty()
    applicant_id: number;

    @IsInt()
    @IsNotEmpty()
    job_id: number;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => EvaluationScoreDto)
    evaluations: EvaluationScoreDto[];

    @IsString()
    @IsOptional()
    comment?: string | null;
}