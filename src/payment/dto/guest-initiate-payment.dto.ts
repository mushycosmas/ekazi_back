 import {
    IsEmail,
    IsInt,
    IsNotEmpty,
    IsOptional,
    IsString,
} from 'class-validator';
import { Type } from 'class-transformer';

export class GuestInitiatePaymentDto {

    @Type(() => Number)
    @IsInt()
    plan_id: number;

    @IsNotEmpty()
    @IsString()
    firstname: string;

    @IsOptional()
    @IsString()
    middlename?: string;

    @IsNotEmpty()
    @IsString()
    lastname: string;

    @IsNotEmpty()
    @IsEmail()
    email: string;

    @IsNotEmpty()
    @IsString()
    phone: string;

    @IsOptional()
    @IsString()
    provider?: string;
}