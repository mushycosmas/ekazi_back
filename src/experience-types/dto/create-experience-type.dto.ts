import {
  IsNotEmpty,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateExperienceTypeDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;
}