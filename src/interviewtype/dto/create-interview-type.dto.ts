import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateInterviewTypeDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    name: string;
}