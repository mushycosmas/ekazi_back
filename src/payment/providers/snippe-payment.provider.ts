//  import {
//     Injectable,
//     InternalServerErrorException,
//     Logger,
// } from '@nestjs/common';

// import {
//     ConfigService,
// } from '@nestjs/config';

// import {
//     HttpService,
// } from '@nestjs/axios';

// import {
//     firstValueFrom,
// } from 'rxjs';

// import {
//     InitiatePaymentInput,
//     PaymentProvider,
//     PaymentProviderResponse,
//     VerifyPaymentInput,
// } from '../interfaces/payment-provider.interface';


// @Injectable()
// export class SnippePaymentProvider
//     implements PaymentProvider {


//     private readonly logger =
//         new Logger(
//             SnippePaymentProvider.name,
//         );


//     constructor(

//         private readonly httpService:
//             HttpService,

//         private readonly configService:
//             ConfigService,

//     ) {}


//     // ============================================================
//     // INITIATE PAYMENT
//     // ============================================================

//     async initiate(
//         data: InitiatePaymentInput,
//     ): Promise<PaymentProviderResponse> {

//         const apiKey =
//             this.configService.get<string>(
//                 'SNIPPE_API_KEY',
//             );


//         const url =
//             this.configService.get<string>(
//                 'SNIPPE_PAYMENT_URL',
//             );


//         const webhookUrl =
//             this.configService.get<string>(
//                 'SNIPPE_WEBHOOK_URL',
//             );


//         if (!apiKey) {

//             throw new InternalServerErrorException(
//                 'SNIPPE_API_KEY is not configured',
//             );

//         }


//         if (!url) {

//             throw new InternalServerErrorException(
//                 'SNIPPE_PAYMENT_URL is not configured',
//             );

//         }


//         try {

//             // ====================================================
//             // CUSTOMER VALIDATION
//             // ====================================================

//             if (
//                 !data.customer?.firstname?.trim()
//             ) {

//                 throw new Error(
//                     'Customer first name is required',
//                 );

//             }


//             if (
//                 !data.customer?.lastname?.trim()
//             ) {

//                 throw new Error(
//                     'Customer last name is required',
//                 );

//             }


//             if (
//                 !data.customer?.email?.trim()
//             ) {

//                 throw new Error(
//                     'Customer email is required',
//                 );

//             }


//             // ====================================================
//             // NORMALIZE PHONE
//             // ====================================================

//             const phone =
//                 this.normalizePhone(
//                     data.phone,
//                 );


//             // ====================================================
//             // CREATE PAYLOAD
//             // ====================================================

//             const payload = {

//                 payment_type:
//                     'mobile',

//                 details: {

//                     amount:
//                         Math.round(
//                             Number(
//                                 data.amount,
//                             ),
//                         ),

//                     currency:
//                         data.currency,

//                 },

//                 phone_number:
//                     phone,

//                 customer: {

//                     firstname:
//                         data.customer.firstname.trim(),

//                     lastname:
//                         data.customer.lastname.trim(),

//                     email:
//                         data.customer.email.trim(),

//                 },

//                 webhook_url:
//                     webhookUrl ||
//                     data.callbackUrl,

//                 metadata: {

//                     // YOUR INTERNAL REFERENCE
//                     order_id:
//                         data.reference,

//                 },

//             };


//             // ====================================================
//             // LOG PAYLOAD
//             // ====================================================

//             this.logger.log(
//                 `Snippe payment payload: ${JSON.stringify(
//                     payload,
//                 )}`,
//             );


//             // ====================================================
//             // SEND REQUEST
//             // ====================================================

//             const response =
//                 await firstValueFrom(

//                     this.httpService.post(

//                         url,

//                         payload,

//                         {

//                             headers: {

//                                 'Content-Type':
//                                     'application/json',

//                                 Authorization:
//                                     `Bearer ${apiKey}`,

//                                 Accept:
//                                     'application/json',

//                             },

//                             timeout:
//                                 30000,

//                         },

//                     ),

//                 );


//             const result =
//                 response.data;


//             // ====================================================
//             // SNIPPE TRANSACTION REFERENCE
//             //
//             // Example:
//             // SN1787560888555
//             // ====================================================

//             const transactionId =
//                 result?.data?.reference ||
//                 result?.reference;


//             if (!transactionId) {

//                 this.logger.error(
//                     `Snippe did not return transaction reference: ${JSON.stringify(
//                         result,
//                     )}`,
//                 );

//                 return {

//                     success:
//                         false,

//                     message:
//                         'Snippe did not return a payment reference',

//                     raw:
//                         result,

//                 };

//             }


//             this.logger.log(
//                 `Snippe payment created successfully. ` +
//                 `Internal reference: ${data.reference}, ` +
//                 `Snippe reference: ${transactionId}`,
//             );


//             return {

//                 success:
//                     true,

//                 transactionId,

//                 raw:
//                     result,

//             };


//         } catch (error) {

//             const responseData =
//                 error?.response?.data;


//             this.logger.error(

//                 'Snippe payment initiation failed',

//                 responseData ||
//                 error?.message,

//             );


//             return {

//                 success:
//                     false,

//                 message:

//                     responseData?.message ||

//                     responseData?.error ||

//                     error?.message ||

//                     'Snippe payment initiation failed',

//                 raw:
//                     responseData,

//             };

//         }

//     }


//     // ============================================================
//     // VERIFY PAYMENT
//     // ============================================================

//     async verify(
//         data: VerifyPaymentInput,
//     ): Promise<PaymentProviderResponse> {

//         const apiKey =
//             this.configService.get<string>(
//                 'SNIPPE_API_KEY',
//             );


//         if (!apiKey) {

//             throw new InternalServerErrorException(
//                 'SNIPPE_API_KEY is not configured',
//             );

//         }


//         if (
//             !data.reference
//         ) {

//             return {

//                 success:
//                     false,

//                 message:
//                     'Payment reference is required',

//             };

//         }


//         try {

//             // ====================================================
//             // SNIPPE PAYMENT STATUS ENDPOINT
//             //
//             // data.reference should normally be:
//             //
//             // SN1787560888555
//             // ====================================================

//             const url =
//                 `https://api.snippe.sh/v1/payments/${encodeURIComponent(
//                     data.reference,
//                 )}`;


//             this.logger.log(
//                 `Verifying Snippe payment: ${data.reference}`,
//             );


//             const response =
//                 await firstValueFrom(

//                     this.httpService.get(

//                         url,

//                         {

//                             headers: {

//                                 Authorization:
//                                     `Bearer ${apiKey}`,

//                                 Accept:
//                                     'application/json',

//                             },

//                             timeout:
//                                 30000,

//                         },

//                     ),

//                 );


//             const result =
//                 response.data;


//             this.logger.log(
//                 `Snippe verification response: ${JSON.stringify(
//                     result,
//                 )}`,
//             );


//             // ====================================================
//             // RESPONSE DATA
//             // ====================================================

//             const payment =
//                 result?.data ||
//                 result;


//             const status =
//                 String(
//                     payment?.status ||
//                     '',
//                 )
//                     .trim()
//                     .toLowerCase();


//             const transactionId =
//                 payment?.reference ||
//                 data.reference;


//             // ====================================================
//             // COMPLETED
//             // ====================================================

//             if (

//                 status === 'completed' ||

//                 status === 'success' ||

//                 status === 'successful' ||

//                 status === 'paid'

//             ) {

//                 this.logger.log(
//                     `Snippe payment confirmed: ${transactionId}`,
//                 );


//                 return {

//                     success:
//                         true,

//                     transactionId,

//                     message:
//                         'Payment completed successfully',

//                     raw:
//                         result,

//                 };

//             }


//             // ====================================================
//             // PENDING
//             // ====================================================

//             if (

//                 status === 'pending' ||

//                 status === 'processing'

//             ) {

//                 this.logger.log(
//                     `Snippe payment still pending: ${transactionId}`,
//                 );


//                 return {

//                     success:
//                         false,

//                     transactionId,

//                     message:
//                         `Payment is still ${status}`,

//                     raw:
//                         result,

//                 };

//             }


//             // ====================================================
//             // FAILED / CANCELLED / EXPIRED
//             // ====================================================

//             this.logger.warn(
//                 `Snippe payment not completed. ` +
//                 `Reference=${transactionId}, ` +
//                 `Status=${status || 'unknown'}`,
//             );


//             return {

//                 success:
//                     false,

//                 transactionId,

//                 message:
//                     `Payment status: ${
//                         status || 'unknown'
//                     }`,

//                 raw:
//                     result,

//             };


//         } catch (error) {

//             const responseData =
//                 error?.response?.data;


//             this.logger.error(

//                 'Snippe payment verification failed',

//                 responseData ||
//                 error?.message,

//             );


//             return {

//                 success:
//                     false,

//                 transactionId:
//                     data.reference,

//                 message:

//                     responseData?.message ||

//                     responseData?.error ||

//                     error?.message ||

//                     'Snippe payment verification failed',

//                 raw:
//                     responseData,

//             };

//         }

//     }


//     // ============================================================
//     // NORMALIZE PHONE
//     // ============================================================

//     private normalizePhone(
//         phone: string,
//     ): string {

//         let value =
//             String(
//                 phone,
//             )
//                 .trim()
//                 .replace(
//                     /\s+/g,
//                     '',
//                 );


//         // +255652074072
//         // ↓
//         // 255652074072

//         if (
//             value.startsWith('+')
//         ) {

//             value =
//                 value.substring(1);

//         }


//         // 0652074072
//         // ↓
//         // 255652074072

//         if (
//             value.startsWith('0')
//         ) {

//             value =
//                 `255${value.substring(1)}`;

//         }


//         return value;

//     }

// }
import {
    Injectable,
    InternalServerErrorException,
    Logger,
    BadRequestException,
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
    ListPaymentsInput,
    ListPaymentsResponse,
    BalanceResponse,
    SearchPaymentsInput,
    SearchPaymentsResponse,
    TriggerUssdPushInput,
    TriggerUssdPushResponse,
} from '../interfaces/payment-provider.interface';


@Injectable()
export class SnippePaymentProvider
    implements PaymentProvider {

    private readonly logger =
        new Logger(
            SnippePaymentProvider.name,
        );

    private readonly baseUrl: string;

    constructor(
        private readonly httpService: HttpService,
        private readonly configService: ConfigService,
    ) {
        this.baseUrl = this.configService.get<string>(
            'SNIPPE_BASE_URL',
        ) || 'https://api.snippe.sh';
    }

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

        const webhookUrl =
            this.configService.get<string>(
                'SNIPPE_WEBHOOK_URL',
            );

        if (!apiKey) {
            throw new InternalServerErrorException(
                'SNIPPE_API_KEY is not configured',
            );
        }

        try {
            // ====================================================
            // CUSTOMER VALIDATION
            // ====================================================

            if (!data.customer?.firstname?.trim()) {
                throw new BadRequestException(
                    'Customer first name is required',
                );
            }

            if (!data.customer?.lastname?.trim()) {
                throw new BadRequestException(
                    'Customer last name is required',
                );
            }

            if (!data.customer?.email?.trim()) {
                throw new BadRequestException(
                    'Customer email is required',
                );
            }

            // ====================================================
            // VALIDATE AMOUNT (Minimum 500 TZS)
            // ====================================================

            const amount = Math.round(Number(data.amount));
            if (amount < 500) {
                throw new BadRequestException(
                    'Minimum payment amount is 500 TZS',
                );
            }

            // ====================================================
            // NORMALIZE PHONE
            // ====================================================

            const phone = this.normalizePhone(data.phone);

            // ====================================================
            // CREATE PAYLOAD
            // ====================================================

            const payload = {
                payment_type: 'mobile',
                details: {
                    amount: amount,
                    currency: data.currency || 'TZS',
                },
                phone_number: phone,
                customer: {
                    firstname: data.customer.firstname.trim(),
                    lastname: data.customer.lastname.trim(),
                    email: data.customer.email.trim(),
                },
                webhook_url: webhookUrl || data.callbackUrl,
                metadata: {
                    order_id: data.reference,
                    client_id: data.customer.client_id,
                },
            };

            // ====================================================
            // LOG PAYLOAD
            // ====================================================

            this.logger.log(
                `Snippe payment payload: ${JSON.stringify(payload)}`,
            );

            // ====================================================
            // BUILD HEADERS WITH IDEMPOTENCY
            // ====================================================

            const headers: any = {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
                'Accept': 'application/json',
            };

            // Add idempotency key if provided
            if (data.idempotencyKey) {
                headers['Idempotency-Key'] = data.idempotencyKey;
                this.logger.log(
                    `Using idempotency key: ${data.idempotencyKey}`,
                );
            }

            // ====================================================
            // SEND REQUEST
            // ====================================================

            const response = await firstValueFrom(
                this.httpService.post(
                    `${this.baseUrl}/v1/payments`,
                    payload,
                    {
                        headers,
                        timeout: 30000,
                    },
                ),
            );

            const result = response.data;

            // ====================================================
            // SNIPPE TRANSACTION REFERENCE
            // ====================================================

            const transactionId =
                result?.data?.reference ||
                result?.reference;

            if (!transactionId) {
                this.logger.error(
                    `Snippe did not return transaction reference: ${JSON.stringify(result)}`,
                );

                return {
                    success: false,
                    message: 'Snippe did not return a payment reference',
                    raw: result,
                };
            }

            this.logger.log(
                `Snippe payment created successfully. ` +
                `Internal reference: ${data.reference}, ` +
                `Snippe reference: ${transactionId}`,
            );

            return {
                success: true,
                transactionId,
                raw: result,
                data: result,
                message: 'Payment initiated successfully',
            };

        } catch (error) {
            const responseData = error?.response?.data;

            this.logger.error(
                'Snippe payment initiation failed',
                responseData || error?.message,
            );

            return {
                success: false,
                message: responseData?.message ||
                    responseData?.error ||
                    error?.message ||
                    'Snippe payment initiation failed',
                raw: responseData,
            };
        }
    }

    // ============================================================
    // VERIFY PAYMENT
    // ============================================================

    async verify(
        data: VerifyPaymentInput,
    ): Promise<PaymentProviderResponse> {

        const apiKey = this.configService.get<string>(
            'SNIPPE_API_KEY',
        );

        if (!apiKey) {
            throw new InternalServerErrorException(
                'SNIPPE_API_KEY is not configured',
            );
        }

        if (!data.reference) {
            return {
                success: false,
                message: 'Payment reference is required',
            };
        }

        try {
            const url =
                `${this.baseUrl}/v1/payments/${encodeURIComponent(data.reference)}`;

            this.logger.log(
                `Verifying Snippe payment: ${data.reference}`,
            );

            const response = await firstValueFrom(
                this.httpService.get(
                    url,
                    {
                        headers: {
                            'Authorization': `Bearer ${apiKey}`,
                            'Accept': 'application/json',
                        },
                        timeout: 30000,
                    },
                ),
            );

            const result = response.data;
            const payment = result?.data || result;
            const status = String(payment?.status || '')
                .trim()
                .toLowerCase();
            const transactionId = payment?.reference || data.reference;

            this.logger.log(
                `Snippe payment status: ${status} for ${transactionId}`,
            );

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
                    success: true,
                    transactionId,
                    message: 'Payment completed successfully',
                    raw: result,
                    data: payment,
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
                    success: false,
                    transactionId,
                    message: `Payment is still ${status}`,
                    raw: result,
                    data: payment,
                };
            }

            // ====================================================
            // FAILED / CANCELLED / EXPIRED / VOIDED
            // ====================================================

            this.logger.warn(
                `Snippe payment not completed. ` +
                `Reference=${transactionId}, ` +
                `Status=${status || 'unknown'}`,
            );

            return {
                success: false,
                transactionId,
                message: `Payment status: ${status || 'unknown'}`,
                raw: result,
                data: payment,
            };

        } catch (error) {
            const responseData = error?.response?.data;

            this.logger.error(
                'Snippe payment verification failed',
                responseData || error?.message,
            );

            if (error?.response?.status === 404) {
                return {
                    success: false,
                    transactionId: data.reference,
                    message: 'Payment not found',
                    raw: responseData,
                };
            }

            return {
                success: false,
                transactionId: data.reference,
                message: responseData?.message ||
                    responseData?.error ||
                    error?.message ||
                    'Snippe payment verification failed',
                raw: responseData,
            };
        }
    }

    // ============================================================
    // 🆕 LIST PAYMENTS
    // ============================================================

    async listPayments(
        data: ListPaymentsInput,
    ): Promise<ListPaymentsResponse> {

        const apiKey = this.configService.get<string>(
            'SNIPPE_API_KEY',
        );

        if (!apiKey) {
            throw new InternalServerErrorException(
                'SNIPPE_API_KEY is not configured',
            );
        }

        try {
            // Validate parameters
            const limit = Math.min(data.limit || 20, 100);
            const offset = Math.max(data.offset || 0, 0);

            this.logger.log(
                `Listing Snippe payments: limit=${limit}, offset=${offset}`,
            );

            const response = await firstValueFrom(
                this.httpService.get(
                    `${this.baseUrl}/v1/payments`,
                    {
                        headers: {
                            'Authorization': `Bearer ${apiKey}`,
                            'Accept': 'application/json',
                        },
                        params: {
                            limit,
                            offset,
                        },
                        timeout: 30000,
                    },
                ),
            );

            const result = response.data;
            const responseData = result?.data || result;

            return {
                success: true,
                data: {
                    payments: responseData?.payments || responseData || [],
                    total: responseData?.total || 0,
                    limit,
                    offset,
                },
                message: 'Payments retrieved successfully',
            };

        } catch (error) {
            const responseData = error?.response?.data;

            this.logger.error(
                'Snippe list payments failed',
                responseData || error?.message,
            );

            return {
                success: false,
                data: {
                    payments: [],
                    total: 0,
                    limit: data.limit || 20,
                    offset: data.offset || 0,
                },
                message: responseData?.message ||
                    responseData?.error ||
                    error?.message ||
                    'Failed to list payments',
            };
        }
    }

    // ============================================================
    // 🆕 GET BALANCE
    // ============================================================

    async getBalance(): Promise<BalanceResponse> {

        const apiKey = this.configService.get<string>(
            'SNIPPE_API_KEY',
        );

        if (!apiKey) {
            throw new InternalServerErrorException(
                'SNIPPE_API_KEY is not configured',
            );
        }

        try {
            this.logger.log('Fetching Snippe account balance');

            const response = await firstValueFrom(
                this.httpService.get(
                    `${this.baseUrl}/v1/payments/balance`,
                    {
                        headers: {
                            'Authorization': `Bearer ${apiKey}`,
                            'Accept': 'application/json',
                        },
                        timeout: 30000,
                    },
                ),
            );

            const result = response.data;
            const data = result?.data || result;

            return {
                success: true,
                data: {
                    balance: data?.balance || 0,
                    currency: data?.currency || 'TZS',
                    available: data?.available || 0,
                    pending: data?.pending || 0,
                    updated_at: data?.updated_at || new Date().toISOString(),
                },
                message: 'Balance retrieved successfully',
            };

        } catch (error) {
            const responseData = error?.response?.data;

            this.logger.error(
                'Snippe get balance failed',
                responseData || error?.message,
            );

            return {
                success: false,
                data: {
                    balance: 0,
                    currency: 'TZS',
                    available: 0,
                    pending: 0,
                    updated_at: new Date().toISOString(),
                },
                message: responseData?.message ||
                    responseData?.error ||
                    error?.message ||
                    'Failed to get balance',
            };
        }
    }

    // ============================================================
    // 🆕 SEARCH PAYMENTS
    // ============================================================

    async searchPayments(
        data: SearchPaymentsInput,
    ): Promise<SearchPaymentsResponse> {

        const apiKey = this.configService.get<string>(
            'SNIPPE_API_KEY',
        );

        if (!apiKey) {
            throw new InternalServerErrorException(
                'SNIPPE_API_KEY is not configured',
            );
        }

        if (!data.reference || data.reference.trim().length === 0) {
            return {
                success: false,
                data: {
                    payments: [],
                },
                message: 'Payment reference is required for search',
            };
        }

        try {
            this.logger.log(
                `Searching Snippe payments for: ${data.reference}`,
            );

            const response = await firstValueFrom(
                this.httpService.get(
                    `${this.baseUrl}/v1/payments/search`,
                    {
                        headers: {
                            'Authorization': `Bearer ${apiKey}`,
                            'Accept': 'application/json',
                        },
                        params: {
                            reference: data.reference.trim(),
                        },
                        timeout: 30000,
                    },
                ),
            );

            const result = response.data;
            const responseData = result?.data || result;

            const payments = responseData?.payments || responseData || [];

            return {
                success: true,
                data: {
                    payments: Array.isArray(payments) ? payments : [payments],
                },
                message: payments.length > 0
                    ? 'Search completed successfully'
                    : 'No payments found for the reference',
            };

        } catch (error) {
            const responseData = error?.response?.data;

            this.logger.error(
                `Snippe search payments failed for: ${data.reference}`,
                responseData || error?.message,
            );

            if (error?.response?.status === 404) {
                return {
                    success: false,
                    data: {
                        payments: [],
                    },
                    message: 'No payments found for the reference',
                };
            }

            return {
                success: false,
                data: {
                    payments: [],
                },
                message: responseData?.message ||
                    responseData?.error ||
                    error?.message ||
                    'Failed to search payments',
            };
        }
    }

    // ============================================================
    // 🆕 TRIGGER USSD PUSH
    // ============================================================

    async triggerUssdPush(
        data: TriggerUssdPushInput,
    ): Promise<TriggerUssdPushResponse> {

        const apiKey = this.configService.get<string>(
            'SNIPPE_API_KEY',
        );

        if (!apiKey) {
            throw new InternalServerErrorException(
                'SNIPPE_API_KEY is not configured',
            );
        }

        if (!data.reference || data.reference.trim().length === 0) {
            return {
                success: false,
                data: {
                    status: 'failed',
                    message: 'Payment reference is required',
                    reference: data.reference || '',
                },
                message: 'Payment reference is required',
            };
        }

        try {
            this.logger.log(
                `Triggering USSD push for payment: ${data.reference}`,
            );

            const response = await firstValueFrom(
                this.httpService.post(
                    `${this.baseUrl}/v1/payments/${encodeURIComponent(data.reference)}/push`,
                    {},
                    {
                        headers: {
                            'Authorization': `Bearer ${apiKey}`,
                            'Content-Type': 'application/json',
                            'Accept': 'application/json',
                        },
                        timeout: 30000,
                    },
                ),
            );

            const result = response.data;
            const responseData = result?.data || result;
            const status = String(responseData?.status || '').toLowerCase();

            // Check if payment is in pending status
            if (status && status !== 'pending') {
                return {
                    success: false,
                    data: {
                        status: status,
                        message: `Cannot trigger USSD push. Payment status is ${status}`,
                        reference: data.reference,
                    },
                    message: `Payment is not in pending status. Current status: ${status}`,
                };
            }

            return {
                success: true,
                data: {
                    status: status || 'pending',
                    message: responseData?.message || 'USSD push sent successfully',
                    reference: responseData?.reference || data.reference,
                },
                message: 'USSD push triggered successfully',
            };

        } catch (error) {
            const responseData = error?.response?.data;

            this.logger.error(
                `Snippe USSD push failed for: ${data.reference}`,
                responseData || error?.message,
            );

            if (error?.response?.status === 404) {
                return {
                    success: false,
                    data: {
                        status: 'failed',
                        message: 'Payment not found',
                        reference: data.reference,
                    },
                    message: 'Payment not found',
                };
            }

            return {
                success: false,
                data: {
                    status: 'failed',
                    message: responseData?.message ||
                        responseData?.error ||
                        error?.message ||
                        'Failed to trigger USSD push',
                    reference: data.reference,
                },
                message: responseData?.message ||
                    responseData?.error ||
                    error?.message ||
                    'Failed to trigger USSD push',
            };
        }
    }

    // ============================================================
    // NORMALIZE PHONE
    // ============================================================

    private normalizePhone(
        phone: string,
    ): string {

        let value = String(phone)
            .trim()
            .replace(/\s+/g, '');

        // +255652074072 → 255652074072
        if (value.startsWith('+')) {
            value = value.substring(1);
        }

        // 0652074072 → 255652074072
        if (value.startsWith('0')) {
            value = `255${value.substring(1)}`;
        }

        // Validate phone number length (Tanzania: 12 digits including 255)
        if (value.length !== 12) {
            this.logger.warn(
                `Phone number may be invalid: ${phone} → ${value} (length: ${value.length})`,
            );
        }

        return value;
    }
}