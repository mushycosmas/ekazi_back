import {
  IsString,
  MaxLength,
  IsOptional,
} from 'class-validator';


export class CreateLanguageUnderstandDto {

  @IsString()
  @MaxLength(100)
  understand_ability: string;


  @IsOptional()
  creator_id?: number;

}