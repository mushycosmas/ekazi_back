import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export enum CorrespondenceCategory {
  STAGE = 'stage',
  INTERVIEW = 'interview',
  ISSUE = 'issue',
  NOTE = 'note',
  GENERAL = 'general',
}

export class UpdateMessageDto {
  @IsString()
  @IsNotEmpty()
  message: string;

  @IsOptional()
  @IsEnum(CorrespondenceCategory)
  category?: CorrespondenceCategory;
}