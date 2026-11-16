import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export enum CorrespondenceCategory {
  STAGE = 'stage',
  INTERVIEW = 'interview',
  ISSUE = 'issue',
  NOTE = 'note',
  GENERAL = 'general',
}

export class SendMessageDto {
  @IsInt()
  thread_id: number;

  @IsString()
  @IsNotEmpty()
  message: string;

  @IsEnum(CorrespondenceCategory)
  @IsOptional()
  category?: CorrespondenceCategory;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  subject?: string;

  @IsOptional()
  @IsInt()
  reply_to_id?: number;

  @IsOptional()
  meta?: Record<string, any>;
}