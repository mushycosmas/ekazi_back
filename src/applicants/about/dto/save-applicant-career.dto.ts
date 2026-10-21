import {
  IsNotEmpty,
  IsString,
  MaxLength,
} from 'class-validator';

export class SaveApplicantCareerDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(10000)
  career: string;
}