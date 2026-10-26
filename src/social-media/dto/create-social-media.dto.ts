import {
    IsNotEmpty,
    IsString,
    MaxLength,
} from 'class-validator';

export class CreateSocialMediaDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(200)
    media_name: string;
}