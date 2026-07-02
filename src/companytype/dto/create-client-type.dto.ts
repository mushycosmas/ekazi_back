import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateClientTypeDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  type_name: string;
}