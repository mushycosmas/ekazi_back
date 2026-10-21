import { Transform, Type } from 'class-transformer';
import {
  IsDate,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

const emptyToUndefined = ({ value }: { value: unknown }) =>
  value === '' || value === null || value === undefined
    ? undefined
    : value;

export class CreateApplicantTrainingDto {
  @Transform(emptyToUndefined)
  @IsString()
  @MaxLength(200)
  name: string;

  @Transform(emptyToUndefined)
  @IsString()
  @MaxLength(200)
  institution: string;

  @Transform(emptyToUndefined)
  @IsOptional()
  @IsString()
  description?: string | null;

  @Transform(emptyToUndefined)
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  started?: Date;

  @Transform(emptyToUndefined)
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  ended?: Date;

  // Set by the controller after file upload.
  @IsOptional()
  @IsString()
  @MaxLength(255)
  attachment?: string;
}