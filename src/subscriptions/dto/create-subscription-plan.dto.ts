import {
    IsArray,
    IsBoolean,
    IsEnum,
    IsInt,
    IsNumber,
    IsOptional,
    IsString,
    MaxLength,
    Min,
} from 'class-validator';

import {
    SubscriptionTarget,
} from 'src/payment/entities/subscription-plan.entity';

export class CreateSubscriptionPlanDto {

    @IsString()
    @MaxLength(300)
    name: string;

    @IsNumber()
    @Min(0)
    price: number;

    @IsEnum(SubscriptionTarget)
    role: SubscriptionTarget;

    // ---------------------------------------------
    // EMPLOYER
    // ---------------------------------------------

    @IsOptional()
    @IsInt()
    @Min(0)
    job_post_limit?: number | null;

    @IsOptional()
    @IsInt()
    @Min(0)
    cv_download_limit?: number | null;

    // ---------------------------------------------
    // PLAN TYPE
    // ---------------------------------------------

    @IsOptional()
    @IsString()
    @MaxLength(100)
    current_type?: string;

    @IsInt()
    @Min(1)
    duration_days: number;

    // ---------------------------------------------
    // APPLICANT
    // ---------------------------------------------

    @IsOptional()
    @IsInt()
    @Min(0)
    cv_builder_limit?: number | null;

  

    @IsOptional()
    @IsBoolean()
    popular?: boolean;



    // ---------------------------------------------
    // STATUS
    // ---------------------------------------------

    @IsOptional()
    @IsBoolean()
    is_active?: boolean;

    // ---------------------------------------------
    // FEATURES
    // Example: [1, 2, 3]
    // ---------------------------------------------

    @IsOptional()
    @IsArray()
    @IsInt({
        each: true,
    })
    features?: number[];
}