import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AdminSubscriptionService } from './admin-subscription.service';
import { AdminSubscriptionController } from './admin-subscription.controller';

import { Subscription } from 'src/payment/entities/subscription.entity';
import { SubscriptionPlan } from 'src/payment/entities/subscription-plan.entity';
import { SubscriptionPayment } from 'src/payment/entities/subscription-payment.entity';

import { Applicants } from 'src/entities/applicants/applicants.entity';
import { Clients } from 'src/client/clients.entity';

import { ApplicantModule } from 'src/applicants/applicant.module';
import { PaymentModule } from 'src/payment/payment.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            Subscription,
            SubscriptionPlan,
            SubscriptionPayment,
            Applicants,
            Clients,
        ]),

        ApplicantModule,

        PaymentModule,
    ],

    controllers: [
        AdminSubscriptionController,
    ],

    providers: [
        AdminSubscriptionService,
    ],
})
export class AdminSubscriptionModule {}