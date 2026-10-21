import {
  ArrayNotEmpty,
  IsArray,
  IsString,
  MaxLength,
} from 'class-validator';

export class SaveApplicantSoftwareDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  @MaxLength(100, { each: true })
  software: string[];
}