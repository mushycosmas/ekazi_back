import {
  IsArray,
  IsIn,
  IsNumber,
  IsOptional,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CalculateTaxDto {
  @IsIn(['gross', 'net'])
  salaryType: 'gross' | 'net';

  @IsOptional()
  @IsNumber()
  @Min(0)
  basicPay?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  netPay?: number;

  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  @Min(0, { each: true })
  allowances?: number[];

  @IsOptional()
  @IsNumber()
  @Min(0)
  insurance?: number;

  @IsOptional()
  @IsIn(['tzs', 'usd'])
  currencyType?: 'tzs' | 'usd';

  @IsOptional()
  @IsNumber()
  @Min(0.000001)
  exchangeRate?: number;
}