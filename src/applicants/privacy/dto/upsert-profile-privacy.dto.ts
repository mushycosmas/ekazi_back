import { IsInt, Min } from 'class-validator';

export class UpsertProfilePrivacyDto {
  @IsInt()
  @Min(1)
  status_id: number;

  @IsInt()
  value: number;
}