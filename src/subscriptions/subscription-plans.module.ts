 import {
    Module,
} from '@nestjs/common';

import {
    TypeOrmModule,
} from '@nestjs/typeorm';

import {
    SubscriptionPlan,
} from 'src/payment/entities/subscription-plan.entity';

import {
    PlanFeature,
} from 'src/payment/entities/plan-feature.entity';

import {
    SubscriptionFeature,
} from 'src/payment/entities/subscription-feature.entity';

import {
    SubscriptionPlansController,
} from './subscription-plans.controller';

import {
    SubscriptionPlansService,
} from './subscription-plans.service';
import { Users } from 'src/entities/users.entity';
import { PersonalAccessToken } from 'src/entities/personal-access-token.entity';


@Module({

    imports: [

        TypeOrmModule.forFeature([

            SubscriptionPlan,

            PlanFeature,

            SubscriptionFeature,
            Users,
            PersonalAccessToken,

        ]),

    ],

    controllers: [

        SubscriptionPlansController,

    ],

    providers: [

        SubscriptionPlansService,

    ],

    exports: [

        SubscriptionPlansService,

    ],
})
export class SubscriptionPlansModule {}