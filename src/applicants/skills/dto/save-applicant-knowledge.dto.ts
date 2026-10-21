import {
  IsArray,
  ArrayNotEmpty,
  IsString,
  MaxLength,
} from 'class-validator';

export class SaveApplicantKnowledgeDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  @MaxLength(255, { each: true })
  knowledge: string[];
}