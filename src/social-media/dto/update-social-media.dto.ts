import {
    IsOptional,
    IsString,
    IsNotEmpty,
    MaxLength,
} from 'class-validator';

export class UpdateSocialMediaDto {
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    @MaxLength(200)
    media_name?: string;
}