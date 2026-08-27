import {
    IsInt,
    IsNotEmpty,
    IsOptional,
    IsString,
    Min,
} from 'class-validator';

export class CreateTermConditionDto {
    @IsInt()
    @Min(1)
    creator_id: number;

    @IsInt()
    @Min(1)
    type_id: number;

    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsNotEmpty()
    body: string;

    @IsOptional()
    @IsInt()
    @Min(0)
    hide?: number;
}