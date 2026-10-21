import {
  IsArray,
  ArrayNotEmpty,
  IsString,
  MaxLength,
} from 'class-validator';

export class SaveApplicantCulturesDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  @MaxLength(255, { each: true })
  cultures: string[];
}