import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';

import { PersonalAccessToken } from 'src/entities/personal-access-token.entity';
import { Users } from 'src/entities/users.entity';
import { SubscriptionPayment } from 'src/payment/entities/subscription-payment.entity';

@Global()
@Module({
    imports: [
        TypeOrmModule.forFeature([
            PersonalAccessToken,
            Users,
            SubscriptionPayment,
        ]),
    ],
    controllers: [NotificationsController],
    providers: [NotificationsService],
    exports: [NotificationsService],
})
export class NotificationsModule {}