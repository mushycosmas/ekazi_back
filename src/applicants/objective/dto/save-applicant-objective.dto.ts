import {
  IsNotEmpty,
  IsString,
  MaxLength,
} from 'class-validator';

export class SaveApplicantObjectiveDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(10000)
  objective: string;
}