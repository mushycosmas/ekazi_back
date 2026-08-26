import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubscriptionFeature } from 'src/payment/entities/subscription-feature.entity';
import { SubscriptionPlan } from 'src/payment/entities/subscription-plan.entity';
import { SubscriptionPlanFeaturesController } from './subscription-plan-features.controller';
import { SubscriptionPlanFeaturesService } from './subscription-plan-features.service';
import { SubscriptionPlansService } from './subscription-plans.service';
import { SubscriptionPlansController } from './subscription-plans.controller';
import { SubscriptionPlansModule } from './subscription-plans.module';
import { PlanFeature } from 'src/payment/entities/plan-feature.entity';
import { Users } from 'src/entities/users.entity';
import { PersonalAccessToken } from 'src/entities/personal-access-token.entity';

@Module({
      imports: [

    TypeOrmModule.forFeature([
      SubscriptionFeature,
      SubscriptionPlan,
      PlanFeature,
      Users,
      PersonalAccessToken,
    ]),

    SubscriptionPlansModule,

  ],

  controllers: [
    SubscriptionPlanFeaturesController,
    SubscriptionPlansController,
  ],

  providers: [
    SubscriptionPlanFeaturesService,
    SubscriptionPlansService,
  ],

  exports: [
    SubscriptionPlanFeaturesService,
  ],
})
export class SubscriptionPlanFeaturesModule {}
