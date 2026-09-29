import {
    IsNotEmpty,
    IsString,
    MaxLength,
} from 'class-validator';

export class CreateBenefitDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    name: string;
}