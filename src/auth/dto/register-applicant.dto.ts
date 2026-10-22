
import {
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
  IsDateString,
} from 'class-validator';

export class RegisterApplicantDto {
  @IsEmail()
  @MaxLength(255)
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsString()
  @IsNotEmpty()
  password_confirmation: string;

  @IsString()
  @MaxLength(255)
  firstname: string;

  @IsString()
  @MaxLength(255)
  middlename: string;

  @IsString()
  @MaxLength(255)
  lastname: string;

  @IsString()
  @MaxLength(255)
  phone: string;

  @IsInt()
  gender_id: number;

  @IsDateString()
  dob: string;

  @IsInt()
  marital_status_id: number;

  @IsInt()
  region_id: number;

  @IsString()
  @MaxLength(255)
  address: string;
}
