import { Transform, Type } from 'class-transformer';
import {
  IsInt,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateApplicantAddressDto {
  @Transform(({ value }) => {
    if (value === undefined || value === null || value === '') {
      return value;
    }
    return Number(value);
  })
  @IsInt()
  @Min(1)
  region_id: number;

  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @MaxLength(100)
  sub_location: string;

  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @MaxLength(200)
  postal: string;
}