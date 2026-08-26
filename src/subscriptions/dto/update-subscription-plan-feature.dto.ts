import {
  PartialType,
} from '@nestjs/mapped-types';

import {
  CreateSubscriptionPlanFeatureDto,
} from './create-subscription-plan-feature.dto';

export class UpdateSubscriptionPlanFeatureDto extends PartialType(
  CreateSubscriptionPlanFeatureDto,
) {}