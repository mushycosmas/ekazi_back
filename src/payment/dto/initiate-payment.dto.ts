import {
    IsInt,
    IsNotEmpty,
    IsOptional,
    IsString,
    Matches,
    Min,
} from 'class-validator';

export class InitiatePaymentDto {

    @IsInt()
    @Min(1)
    plan_id: number;

    @IsString()
    @IsNotEmpty()
    @Matches(
        /^[0-9+\-\s]+$/,
        {
            message:
                'phone must be a valid phone number',
        },
    )
    phone: string;

    @IsOptional()
    @IsString()
    provider?: string;
}