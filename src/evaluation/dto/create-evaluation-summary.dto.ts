import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateEvaluationSummaryDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    summary: string;
}