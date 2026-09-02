import {
    Module,
} from '@nestjs/common';

import {
    TypeOrmModule,
} from '@nestjs/typeorm';

import {
    HttpModule,
} from '@nestjs/axios';

import {
    PaymentController,
} from './payment.controller';

import {
    PaymentService,
} from './payment.service';

import {
    SelcomPaymentProvider,
} from './providers/selcom-payment.provider';

import {
    SnippePaymentProvider,
} from './providers/snippe-payment.provider';

import {
    PaymentProviderFactory,
} from './providers/payment-provider.factory';

import {
    Subscription,
} from './entities/subscription.entity';

import {
    SubscriptionPlan,
} from './entities/subscription-plan.entity';

import {
    SubscriptionPayment,
} from './entities/subscription-payment.entity';

import {
    Users,
} from 'src/entities/users.entity';

import {
    PersonalAccessToken,
} from 'src/entities/personal-access-token.entity';
import { Applicants } from 'src/entities/applicants/applicants.entity';
import { Clients } from 'src/client/clients.entity';


@Module({

    imports: [

        TypeOrmModule.forFeature([

            Subscription,

            SubscriptionPlan,

            SubscriptionPayment,

            Users,

            PersonalAccessToken,
            Applicants,
            Clients,

        ]),

        HttpModule,

    ],


    controllers: [

        PaymentController,

    ],


    providers: [

        PaymentService,

        SelcomPaymentProvider,

        SnippePaymentProvider,

        PaymentProviderFactory,

    ],


    exports: [

        PaymentService,
        PaymentProviderFactory,
    

    ],

})
export class PaymentModule {}