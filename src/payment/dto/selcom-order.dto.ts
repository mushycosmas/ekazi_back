 import {
    IsEmail,
    IsNumber,
    IsOptional,
    IsString,
} from 'class-validator';

export class SelcomOrderDto {
    @IsString()
    vendor: string;

    @IsString()
    order_id: string;

    @IsEmail()
    buyer_email: string;

    @IsString()
    buyer_name: string;

    @IsString()
    buyer_phone: string;

    @IsNumber()
    amount: number;

    @IsString()
    currency: string;

    @IsOptional()
    @IsString()
    buyer_remarks?: string;

    @IsOptional()
    @IsString()
    merchant_remarks?: string;

    @IsOptional()
    @IsNumber()
    no_of_items?: number;

    @IsOptional()
    @IsString()
    redirect_url?: string;

    @IsOptional()
    @IsString()
    cancel_url?: string;

    @IsOptional()
    @IsString()
    webhook?: string;
}

export class SelcomWalletPaymentDto {
    transid: string;
    order_id: string;
    msisdn: string;
}

export class SelcomStatusDto {
    order_id: string;
}