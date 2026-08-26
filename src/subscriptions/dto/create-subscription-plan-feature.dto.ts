import {
  IsInt,
  IsNotEmpty,
  IsString,
} from 'class-validator';

export class CreateSubscriptionPlanFeatureDto {

  
  @IsString()
  @IsNotEmpty()
  feature_name: string;
}