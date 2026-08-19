import {
    IsOptional,
    IsString,
    MaxLength,
} from 'class-validator';

export class UpdatePermissionDto {

    @IsOptional()
    @IsString()
    @MaxLength(255)
    name?: string;

    @IsOptional()
    @IsString()
    @MaxLength(255)
    guard_name?: string;
}