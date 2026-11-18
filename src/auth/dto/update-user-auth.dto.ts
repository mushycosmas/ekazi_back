// dto/update-user-auth.dto.ts

import {
  IsEmail,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class UpdateUserAuthDto {
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  username?: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(150)
  email?: string;
}