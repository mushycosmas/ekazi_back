import {
  IsNotEmpty,
  IsString,
  MaxLength,
  IsOptional,
  IsIn,
} from 'class-validator';

export class CreateStatusDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  status_name: string;

  @IsOptional()
  @IsIn(['0', '1'])
  hide?: string;
}