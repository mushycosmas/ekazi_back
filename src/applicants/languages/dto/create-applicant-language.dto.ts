 import {
  IsInt,
  IsNotEmpty,
} from 'class-validator';

export class CreateApplicantLanguageDto {
  @IsInt()
  @IsNotEmpty()
  language_id: number;

  @IsInt()
  @IsNotEmpty()
  read_id: number;

  @IsInt()
  @IsNotEmpty()
  write_id: number;

  @IsInt()
  @IsNotEmpty()
  speak_id: number;

  @IsInt()
  @IsNotEmpty()
  understand_id: number;
}