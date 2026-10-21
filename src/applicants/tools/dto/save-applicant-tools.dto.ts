import {
  ArrayNotEmpty,
  IsArray,
  IsString,
  MaxLength,
} from 'class-validator';

export class SaveApplicantToolsDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  @MaxLength(30, { each: true })
  tools: string[];
}