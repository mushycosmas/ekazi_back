import { IsEmail, IsString, MinLength, IsOptional, IsNumber } from 'class-validator';

export class CreateEmployerDto {
  @IsEmail()
  email: string;

  @MinLength(8)
  password: string;

  @IsString()
  name: string;

  @IsString()
  phone: string;

  @IsOptional()
  @IsNumber()
  type?: number;
}