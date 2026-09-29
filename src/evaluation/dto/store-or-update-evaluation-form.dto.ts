 import {
    IsBoolean,
    IsIn,
    IsInt,
    IsOptional,
    IsString,
    MaxLength,
} from 'class-validator';

export class StoreOrUpdateEvaluationFormDto {
    @IsOptional()
    @IsInt()
    form_id?: number;

    @IsString()
    @IsIn(['A', 'B', 'C'])
    group: string;

    @IsString()
    @MaxLength(255)
    title: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsBoolean()
    is_active?: boolean;
}