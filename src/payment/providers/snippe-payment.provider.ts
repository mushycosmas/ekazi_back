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
} from '../interfaces/payment-provider.interface';


@Injectable()
export class SnippePaymentProvider
    implements PaymentProvider {


    private readonly logger =
        new Logger(
            SnippePaymentProvider.name,
        );


    constructor(

        private readonly httpService:
            HttpService,

        private readonly configService:
            ConfigService,

    ) {}


    // ============================================================
    // INITIATE PAYMENT
    // ============================================================

    async initiate(
        data: InitiatePaymentInput,
    ): Promise<PaymentProviderResponse> {

        const apiKey =
            this.configService.get<string>(
                'SNIPPE_API_KEY',
            );


        const url =
            this.configService.get<string>(
                'SNIPPE_PAYMENT_URL',
            );


        const webhookUrl =
            this.configService.get<string>(
                'SNIPPE_WEBHOOK_URL',
            );


        if (!apiKey) {

            throw new InternalServerErrorException(
                'SNIPPE_API_KEY is not configured',
            );

        }


        if (!url) {

            throw new InternalServerErrorException(
                'SNIPPE_PAYMENT_URL is not configured',
            );

        }


        try {

            // ====================================================
            // CUSTOMER VALIDATION
            // ====================================================

            if (
                !data.customer?.firstname?.trim()
            ) {

                throw new Error(
                    'Customer first name is required',
                );

            }


            if (
                !data.customer?.lastname?.trim()
            ) {

                throw new Error(
                    'Customer last name is required',
                );

            }


            if (
                !data.customer?.email?.trim()
            ) {

                throw new Error(
                    'Customer email is required',
                );

            }


            // ====================================================
            // NORMALIZE PHONE
            // ====================================================

            const phone =
                this.normalizePhone(
                    data.phone,
                );


            // ====================================================
            // CREATE PAYLOAD
            // ====================================================

            const payload = {

                payment_type:
                    'mobile',

                details: {

                    amount:
                        Math.round(
                            Number(
                                data.amount,
                            ),
                        ),

                    currency:
                        data.currency,

                },

                phone_number:
                    phone,

                customer: {

                    firstname:
                        data.customer.firstname.trim(),

                    lastname:
                        data.customer.lastname.trim(),

                    email:
                        data.customer.email.trim(),

                },

                webhook_url:
                    webhookUrl ||
                    data.callbackUrl,

                metadata: {

                    // YOUR INTERNAL REFERENCE
                    order_id:
                        data.reference,

                },

            };


            // ====================================================
            // LOG PAYLOAD
            // ====================================================

            this.logger.log(
                `Snippe payment payload: ${JSON.stringify(
                    payload,
                )}`,
            );


            // ====================================================
            // SEND REQUEST
            // ====================================================

            const response =
                await firstValueFrom(

                    this.httpService.post(

                        url,

                        payload,

                        {

                            headers: {

                                'Content-Type':
                                    'application/json',

                                Authorization:
                                    `Bearer ${apiKey}`,

                                Accept:
                                    'application/json',

                            },

                            timeout:
                                30000,

                        },

                    ),

                );


            const result =
                response.data;


            // ====================================================
            // SNIPPE TRANSACTION REFERENCE
            //
            // Example:
            // SN1787560888555
            // ====================================================

            const transactionId =
                result?.data?.reference ||
                result?.reference;


            if (!transactionId) {

                this.logger.error(
                    `Snippe did not return transaction reference: ${JSON.stringify(
                        result,
                    )}`,
                );

                return {

                    success:
                        false,

                    message:
                        'Snippe did not return a payment reference',

                    raw:
                        result,

                };

            }


            this.logger.log(
                `Snippe payment created successfully. ` +
                `Internal reference: ${data.reference}, ` +
                `Snippe reference: ${transactionId}`,
            );


            return {

                success:
                    true,

                transactionId,

                raw:
                    result,

            };


        } catch (error) {

            const responseData =
                error?.response?.data;


            this.logger.error(

                'Snippe payment initiation failed',

                responseData ||
                error?.message,

            );


            return {

                success:
                    false,

                message:

                    responseData?.message ||

                    responseData?.error ||

                    error?.message ||

                    'Snippe payment initiation failed',

                raw:
                    responseData,

            };

        }

    }


    // ============================================================
    // VERIFY PAYMENT
    // ============================================================

    async verify(
        data: VerifyPaymentInput,
    ): Promise<PaymentProviderResponse> {

        const apiKey =
            this.configService.get<string>(
                'SNIPPE_API_KEY',
            );


        if (!apiKey) {

            throw new InternalServerErrorException(
                'SNIPPE_API_KEY is not configured',
            );

        }


        if (
            !data.reference
        ) {

            return {

                success:
                    false,

                message:
                    'Payment reference is required',

            };

        }


        try {

            // ====================================================
            // SNIPPE PAYMENT STATUS ENDPOINT
            //
            // data.reference should normally be:
            //
            // SN1787560888555
            // ====================================================

            const url =
                `https://api.snippe.sh/v1/payments/${encodeURIComponent(
                    data.reference,
                )}`;


            this.logger.log(
                `Verifying Snippe payment: ${data.reference}`,
            );


            const response =
                await firstValueFrom(

                    this.httpService.get(

                        url,

                        {

                            headers: {

                                Authorization:
                                    `Bearer ${apiKey}`,

                                Accept:
                                    'application/json',

                            },

                            timeout:
                                30000,

                        },

                    ),

                );


            const result =
                response.data;


            this.logger.log(
                `Snippe verification response: ${JSON.stringify(
                    result,
                )}`,
            );


            // ====================================================
            // RESPONSE DATA
            // ====================================================

            const payment =
                result?.data ||
                result;


            const status =
                String(
                    payment?.status ||
                    '',
                )
                    .trim()
                    .toLowerCase();


            const transactionId =
                payment?.reference ||
                data.reference;


            // ====================================================
            // COMPLETED
            // ====================================================

            if (

                status === 'completed' ||

                status === 'success' ||

                status === 'successful' ||

                status === 'paid'

            ) {

                this.logger.log(
                    `Snippe payment confirmed: ${transactionId}`,
                );


                return {

                    success:
                        true,

                    transactionId,

                    message:
                        'Payment completed successfully',

                    raw:
                        result,

                };

            }


            // ====================================================
            // PENDING
            // ====================================================

            if (

                status === 'pending' ||

                status === 'processing'

            ) {

                this.logger.log(
                    `Snippe payment still pending: ${transactionId}`,
                );


                return {

                    success:
                        false,

                    transactionId,

                    message:
                        `Payment is still ${status}`,

                    raw:
                        result,

                };

            }


            // ====================================================
            // FAILED / CANCELLED / EXPIRED
            // ====================================================

            this.logger.warn(
                `Snippe payment not completed. ` +
                `Reference=${transactionId}, ` +
                `Status=${status || 'unknown'}`,
            );


            return {

                success:
                    false,

                transactionId,

                message:
                    `Payment status: ${
                        status || 'unknown'
                    }`,

                raw:
                    result,

            };


        } catch (error) {

            const responseData =
                error?.response?.data;


            this.logger.error(

                'Snippe payment verification failed',

                responseData ||
                error?.message,

            );


            return {

                success:
                    false,

                transactionId:
                    data.reference,

                message:

                    responseData?.message ||

                    responseData?.error ||

                    error?.message ||

                    'Snippe payment verification failed',

                raw:
                    responseData,

            };

        }

    }


    // ============================================================
    // NORMALIZE PHONE
    // ============================================================

    private normalizePhone(
        phone: string,
    ): string {

        let value =
            String(
                phone,
            )
                .trim()
                .replace(
                    /\s+/g,
                    '',
                );


        // +255652074072
        // ↓
        // 255652074072

        if (
            value.startsWith('+')
        ) {

            value =
                value.substring(1);

        }


        // 0652074072
        // ↓
        // 255652074072

        if (
            value.startsWith('0')
        ) {

            value =
                `255${value.substring(1)}`;

        }


        return value;

    }

}