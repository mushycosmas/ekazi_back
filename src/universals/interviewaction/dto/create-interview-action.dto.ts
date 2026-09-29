import {
    IsNotEmpty,
    IsString,
    MaxLength,
} from 'class-validator';

export class CreateInterviewActionDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    name: string;
}