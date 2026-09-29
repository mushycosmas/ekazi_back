import {
    IsInt,
    IsNotEmpty,
    IsOptional,
    IsString,
    MaxLength,
} from 'class-validator';

export class CreateEvaluationDto {

    @IsString()
    @IsNotEmpty()
    @MaxLength(255)
    group: string;

    @IsOptional()
    @IsInt()
    priority?: number | null;

    @IsString()
    @IsNotEmpty()
    @MaxLength(255)
    name: string;

    @IsString()
    @IsNotEmpty()
    description: string;

    @IsOptional()
    @IsInt()
    hide?: number;

    @IsOptional()
    @IsInt()
    user_id?: number | null;
}