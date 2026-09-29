import {
    IsInt,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    MaxLength,
    Min,
} from 'class-validator';

export class CreateRemarkDto {
    @IsNumber()
    @IsNotEmpty()
    @Min(0)
    score: number;

    @IsString()
    @IsNotEmpty()
    @MaxLength(50)
    remark: string;

    @IsOptional()
    @IsInt()
    hide?: number;
}