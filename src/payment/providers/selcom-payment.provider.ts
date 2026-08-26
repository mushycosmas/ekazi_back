import {
    Injectable,
    InternalServerErrorException,
    Logger,
} from '@nestjs/common';

import {
    ConfigService,
} from '@nestjs/config';

import {
    HttpService,
} from '@nestjs/axios';

import {
    firstValueFrom,
} from 'rxjs';

import {
    InitiatePaymentInput,
    PaymentProvider,
    PaymentProviderResponse,
    VerifyPaymentInput,
}  from '../interfaces/payment-provider.interface';

@Injectable()
export class SelcomPaymentProvider
    implements PaymentProvider {


    private readonly logger =
        new Logger(
            SelcomPaymentProvider.name,
        );


    constructor(

        private readonly httpService:
            HttpService,

        private readonly configService:
            ConfigService,

    ) {}


    async initiate(
        data: InitiatePaymentInput,
    ): Promise<PaymentProviderResponse> {


        const url =
            this.configService.get<string>(
                'SELCOM_CREATE_ORDER_URL',
            );


        const vendor =
            this.configService.get<string>(
                'SELCOM_VENDOR',
            );


        const apiKey =
            this.configService.get<string>(
                'SELCOM_API_KEY',
            );


        if (
            !url ||
            !vendor ||
            !apiKey
        ) {

            throw new InternalServerErrorException(
                'Selcom configuration is missing',
            );

        }


        try {

            const response =
                await firstValueFrom(

                    this.httpService.post(

                        url,

                        {

                            vendor,

                            order_id:
                                data.reference,

                            buyer_phone:
                                data.phone,

                            amount:
                                data.amount,

                            currency:
                                data.currency,

                            callback_url:
                                data.callbackUrl,

                        },

                        {

                            headers: {

                                'Content-Type':
                                    'application/json',

                                Authorization:
                                    `Bearer ${apiKey}`,

                            },

                            timeout:
                                30000,

                        },

                    ),

                );


            return {

                success:
                    true,

                transactionId:
                    data.reference,

                raw:
                    response.data,

            };


        } catch (error) {

            this.logger.error(

                'Selcom initiation failed',

                error?.response?.data ||
                error?.message,

            );


            return {

                success:
                    false,

                message:
                    error?.response?.data?.message ||
                    error?.message ||
                    'Selcom payment failed',

                raw:
                    error?.response?.data,

            };

        }

    }


    async verify(
        data: VerifyPaymentInput,
    ): Promise<PaymentProviderResponse> {


        const url =
            this.configService.get<string>(
                'SELCOM_STATUS_URL',
            );


        const vendor =
            this.configService.get<string>(
                'SELCOM_VENDOR',
            );


        const apiKey =
            this.configService.get<string>(
                'SELCOM_API_KEY',
            );


        if (
            !url ||
            !vendor ||
            !apiKey
        ) {

            throw new InternalServerErrorException(
                'Selcom configuration is missing',
            );

        }


        try {

            const response =
                await firstValueFrom(

                    this.httpService.post(

                        url,

                        {

                            order_id:
                                data.reference,

                            vendor,

                        },

                        {

                            headers: {

                                'Content-Type':
                                    'application/json',

                                Authorization:
                                    `Bearer ${apiKey}`,

                            },

                            timeout:
                                30000,

                        },

                    ),

                );


            const result =
                response.data;


            const success =

                result?.result ===
                    'SUCCESS'

                ||

                result?.status ===
                    'SUCCESS'

                ||

                result?.status ===
                    'success';


            return {

                success,

                transactionId:
                    data.reference,

                message:
                    result?.message,

                raw:
                    result,

            };


        } catch (error) {

            this.logger.error(

                'Selcom verification failed',

                error?.response?.data ||
                error?.message,

            );


            return {

                success:
                    false,

                message:
                    error?.response?.data?.message ||
                    error?.message ||
                    'Selcom verification failed',

                raw:
                    error?.response?.data,

            };

        }

    }

}