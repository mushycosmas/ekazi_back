import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateSavedResumeDto {
  @IsOptional()
  @IsString()
  @MaxLength(300)
  template?: string | null;

  @IsOptional()
  @IsString()
  cv_name?: string | null;
}