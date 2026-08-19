import {
    IsNotEmpty,
    IsOptional,
    IsString,
    MaxLength,
} from 'class-validator';

export class CreatePermissionDto {

    @IsString()
    @IsNotEmpty()
    @MaxLength(255)
    name: string;

    @IsOptional()
    @IsString()
    @MaxLength(255)
    guard_name?: string;
}