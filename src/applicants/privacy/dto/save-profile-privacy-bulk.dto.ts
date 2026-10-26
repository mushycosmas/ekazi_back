import {
  IsArray,
  ArrayNotEmpty,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { UpsertProfilePrivacyDto } from './upsert-profile-privacy.dto';

export class SaveProfilePrivacyBulkDto {
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => UpsertProfilePrivacyDto)
  settings: UpsertProfilePrivacyDto[];
}