import { IsNotEmpty, IsOptional, IsInt, IsString } from 'class-validator';

export class CreatePositionLevelDto {
  @IsString()
  @IsNotEmpty()
  position_name: string;

  @IsOptional()
  @IsInt()
  hide?: number;

  @IsInt()
  creator_id: number;

  @IsInt()
  updator_id: number;
}