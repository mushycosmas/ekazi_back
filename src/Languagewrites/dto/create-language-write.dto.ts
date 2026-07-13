import {
  IsString,
  IsOptional,
  MaxLength,
} from 'class-validator';

export class CreateLanguageWriteDto {

  @IsString()
  @MaxLength(100)
  write_ability: string;


  @IsOptional()
  creator_id?: number;

}