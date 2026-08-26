import {
    Injectable,
    InternalServerErrorException,
} from '@nestjs/common';

import {
    ConfigService,
} from '@nestjs/config';

import {
    PaymentProvider,
} from '../interfaces/payment-provider.interface';

import {
    SelcomPaymentProvider,
} from './selcom-payment.provider';

import {
    SnippePaymentProvider,
} from './snippe-payment.provider';


@Injectable()
export class PaymentProviderFactory {


    constructor(

        private readonly configService:
            ConfigService,

        private readonly selcomProvider:
            SelcomPaymentProvider,

        private readonly snippeProvider:
            SnippePaymentProvider,

    ) {}


    getProvider():
        PaymentProvider {


        const provider =
            this.getProviderName();


        switch (
            provider
        ) {

            case 'selcom':

                return this.selcomProvider;


            case 'snippe':

                return this.snippeProvider;


            default:

                throw new InternalServerErrorException(

                    `Unsupported payment provider: ${provider}`,

                );

        }

    }


    getProviderName():
        string {


        return (

            this.configService.get<string>(
                'PAYMENT_PROVIDER',
                'snippe',
            )

            .trim()

            .toLowerCase()

        );

    }

}