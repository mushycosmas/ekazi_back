import {
  IsEmail,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateApplicantRefereeDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  first_name?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  middle_name?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  last_name?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  employer?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  referee_position?: string | null;

  @IsOptional()
  @IsEmail()
  @MaxLength(255)
  email?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  phone?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(15)
  type?: string | null;
}