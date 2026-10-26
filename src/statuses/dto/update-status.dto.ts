import {
  IsOptional,
  IsString,
  IsNotEmpty,
  MaxLength,
  IsIn,
} from 'class-validator';

export class UpdateStatusDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  status_name?: string;

  @IsOptional()
  @IsIn(['0', '1'])
  hide?: string;
}