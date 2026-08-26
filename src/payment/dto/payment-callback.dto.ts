import {
    IsOptional,
    IsString,
} from 'class-validator';

export class PaymentCallbackDto {

    @IsOptional()
    @IsString()
    order_id?: string;

    @IsOptional()
    @IsString()
    reference?: string;

    @IsOptional()
    @IsString()
    transaction_id?: string;
}