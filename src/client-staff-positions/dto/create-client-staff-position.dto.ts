import { IsString, IsNotEmpty } from 'class-validator';

export class CreateClientStaffPositionDto {
  @IsString()
  @IsNotEmpty()
  position_name: string;
}