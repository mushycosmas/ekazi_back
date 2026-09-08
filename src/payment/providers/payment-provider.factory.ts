import {
    Injectable,
    InternalServerErrorException,
    Logger,
} from '@nestjs/common';

import {
    ConfigService,
} from '@nestjs/config';

import {
    PaymentProvider,
    SelcomProvider,
} from '../interfaces/payment-provider.interface';

import {
    SelcomPaymentProvider,
} from './selcom-payment.provider';

import {
    SnippePaymentProvider,
} from './snippe-payment.provider';


@Injectable()
export class PaymentProviderFactory {

    private readonly logger =
        new Logger(PaymentProviderFactory.name);


    constructor(
        private readonly configService: ConfigService,

        private readonly selcomProvider:
            SelcomPaymentProvider,

        private readonly snippeProvider:
            SnippePaymentProvider,
    ) {}


    // ============================================================
    // GET PAYMENT PROVIDER
    // ============================================================

    getProvider(
        providerName?: string,
    ): PaymentProvider {

        /*
         * If providerName is supplied, use it.
         * Otherwise use PAYMENT_PROVIDER from .env.
         */
        const name = (
            providerName ||
            this.getProviderName()
        )
            .trim()
            .toLowerCase();


        this.logger.log(
            `Using payment provider: ${name}`,
        );


        switch (name) {

            case 'selcom':

                /*
                 * Return SELCOM as the generic
                 * PaymentProvider interface.
                 */
                return this.selcomProvider;


            case 'snippe':

                return this.snippeProvider;


            default:

                throw new InternalServerErrorException(
                    `Unsupported payment provider: ${name}`,
                );

        }

    }


    // ============================================================
    // GET SELCOM PROVIDER
    // ============================================================

    getSelcomProvider(): SelcomProvider {

        this.logger.log(
            'Using SELCOM payment provider',
        );


        /*
         * Return SELCOM using the specialized
         * SelcomProvider interface.
         *
         * This exposes:
         * - createOrder()
         * - walletPayment()
         * - selcompesaPayment()
         * - orderStatus()
         * - cancelOrder()
         */
        return this.selcomProvider;

    }


    // ============================================================
    // GET SNIPPE PROVIDER
    // ============================================================

    getSnippeProvider(): PaymentProvider {

        this.logger.log(
            'Using Snippe payment provider',
        );


        return this.snippeProvider;

    }


    // ============================================================
    // GET DEFAULT PROVIDER FROM CONFIGURATION
    // ============================================================

    getProviderName(): string {

        return (
            this.configService.get<string>(
                'PAYMENT_PROVIDER',
                'snippe',
            )
        )
            .trim()
            .toLowerCase();

    }

}