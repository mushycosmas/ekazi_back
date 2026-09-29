import {
    IsInt,
    IsNotEmpty,
    IsNumber,
    IsString,
} from 'class-validator';

export class PanelCommentDto {
    @IsString()
    @IsNotEmpty()
    comment: string;

    @IsNumber()
    @IsNotEmpty()
    rate: number;

    @IsInt()
    @IsNotEmpty()
    interview_round_id: number;

    @IsInt()
    @IsNotEmpty()
    applicant_id: number;

    @IsInt()
    @IsNotEmpty()
    job_id: number;
}