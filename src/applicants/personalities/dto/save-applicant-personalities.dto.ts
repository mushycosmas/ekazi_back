import {
  IsArray,
  ArrayNotEmpty,
  IsString,
  MaxLength,
} from 'class-validator';

export class SaveApplicantPersonalitiesDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  @MaxLength(100, { each: true })
  personalities: string[];
}