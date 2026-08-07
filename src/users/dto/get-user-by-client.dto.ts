import { IsInt, IsOptional, IsPositive, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class GetUsersByClientDto {
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  clientId: number;

  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number = 1;

  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  limit?: number = 20;
}