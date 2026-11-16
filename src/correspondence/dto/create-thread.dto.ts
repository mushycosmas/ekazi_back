import {
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum ParticipantType {
  ADMIN = 'admin',
  EMPLOYER = 'employer',
  APPLICANT = 'applicant',
  SYSTEM = 'system',
}

export class ThreadParticipantDto {
  @IsInt()
  user_id: number;

  @IsEnum(ParticipantType)
  participant_type: ParticipantType;
}

export class CreateThreadDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  subject: string;

  @IsOptional()
  @IsInt()
  job_id?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ThreadParticipantDto)
  participants: ThreadParticipantDto[];
}