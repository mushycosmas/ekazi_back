import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateJobUniversalTypeDto {

    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    type_name: string;

}