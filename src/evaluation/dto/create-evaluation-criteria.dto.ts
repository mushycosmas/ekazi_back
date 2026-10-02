import {
    IsInt,
    IsNotEmpty,
    IsOptional,
    IsString,
    MaxLength,
} from 'class-validator';

export class CreateEvaluationCriteriaDto {

    @IsInt()
    @IsNotEmpty()
    evaluation_id: number;

    @IsString()
    @IsNotEmpty()
    @MaxLength(255)
    name: string;

    /**
     * 0 = visible
     * 1 = hidden
     */
    @IsInt()
    @IsOptional()
    hide?: number;
}