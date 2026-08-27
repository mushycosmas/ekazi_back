import {
    IsInt,
    IsNotEmpty,
    IsOptional,
    IsString,
    MaxLength,
    Min,
} from 'class-validator';

export class CreateTermConditionTypeDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    type: string;

    @IsOptional()
    @IsInt()
    @Min(0)
    hide?: number;
}