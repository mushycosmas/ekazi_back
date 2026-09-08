import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import {
    PaymentProvider,
    InitiatePaymentInput,
    VerifyPaymentInput,
    PaymentProviderResponse,
    ListPaymentsInput,
    ListPaymentsResponse,
    BalanceResponse,
    SearchPaymentsInput,
    SearchPaymentsResponse,
    TriggerUssdPushInput,
    TriggerUssdPushResponse,
} from '../interfaces/payment-provider.interface';

const { apigwCLient } = require('selcom-apigw-client');


@Injectable()
export class SelcomPaymentProvider implements PaymentProvider {
    private readonly logger = new Logger(
        SelcomPaymentProvider.name,
    );

    private readonly vendor: string;
    private readonly apiKey: string;
    private readonly apiSecret: string;
    private readonly baseUrl: string;

    constructor(
        private readonly configService: ConfigService,
    ) {
        this.vendor =
            this.configService.get<string>('SELCOM_VENDOR') || '';

        this.apiKey =
            this.configService.get<string>('SELCOM_API_KEY') || '';

        this.apiSecret =
            this.configService.get<string>('SELCOM_API_SECRET') || '';

        this.baseUrl =
            this.configService.get<string>('SELCOM_BASE_URL') ||
            'https://apigw.selcommobile.com';

        if (
            !this.vendor ||
            !this.apiKey ||
            !this.apiSecret
        ) {
            throw new Error(
                'SELCOM_VENDOR, SELCOM_API_KEY and SELCOM_API_SECRET are required',
            );
        }
    }

    // ============================================================
    // SELCOM CLIENT
    // ============================================================

    private getClient() {
        return new apigwCLient(
            this.baseUrl,
            this.apiKey,
            this.apiSecret,
        );
    }

    // ============================================================
    // CONFIG
    // ============================================================

    getConfig() {
        return {
            vendor: this.vendor,
            baseUrl: this.baseUrl,
        };
    }

    // ============================================================
    // INITIATE PAYMENT
    // ============================================================

    async initiate(
        data: InitiatePaymentInput,
    ): Promise<PaymentProviderResponse> {
        try {
            const client = this.getClient();

            const orderId = data.reference;

            if (!orderId) {
                throw new Error(
                    'Payment reference/order_id is required',
                );
            }

            // --------------------------------------------------------
            // BUYER NAME
            // --------------------------------------------------------

            const buyerName = this.getBuyerName(data);

            // --------------------------------------------------------
            // PHONE
            // --------------------------------------------------------

            const buyerPhone = this.normalizePhone(
                data.customer?.phone || data.phone,
            );

            if (!buyerPhone) {
                throw new Error(
                    'Buyer phone number is required',
                );
            }

            // --------------------------------------------------------
            // AMOUNT
            // --------------------------------------------------------

            const amount = Number(data.amount);

            if (!amount || amount <= 0) {
                throw new Error(
                    'Payment amount must be greater than zero',
                );
            }

            // ========================================================
            // STEP 1: CREATE ORDER
            // ========================================================

            /**
             * SELCOM checkpoint:
             *
             * const orderJson = {
             *   vendor,
             *   order_id,
             *   buyer_email,
             *   buyer_name,
             *   buyer_phone,
             *   amount,
             *   currency,
             *   buyer_remarks,
             *   merchant_remarks,
             *   no_of_items
             * }
             */

            const orderData = {
                vendor: this.vendor,

                order_id: orderId,

                buyer_email:
                    data.customer?.email || '',

                buyer_name: buyerName,

                buyer_phone: buyerPhone,

                amount,

                currency: data.currency || 'TZS',

                buyer_remarks:
                    `eKazi subscription ${orderId}`,

                merchant_remarks:
                    'eKazi subscription payment',

                no_of_items: 1,
            };

            this.logger.log(
                `Creating SELCOM order: ${orderId}`,
            );

            this.logger.debug(
                `SELCOM create order payload: ${JSON.stringify(
                    {
                        ...orderData,

                        buyer_email:
                            orderData.buyer_email
                                ? '***'
                                : '',

                        buyer_phone:
                            buyerPhone
                                ? `${buyerPhone.substring(0, 6)}******`
                                : '',
                    },
                )}`,
            );

            const orderResponse = await client.postFunc(
                this.configService.get<string>('SELCOM_CREATE_ORDER_URL') ||
                'https://apigw.selcommobile.com/v1/checkout/create-order-minimal',
                orderData,
            );

            this.logger.log(
                `SELCOM create order response: ${JSON.stringify(
                    orderResponse,
                )}`,
            );

            // --------------------------------------------------------
            // CHECK CREATE ORDER
            // --------------------------------------------------------

            if (!this.isOrderCreated(orderResponse)) {
                return {
                    success: false,

                    transactionId: orderId,

                    message:
                        orderResponse?.message ||
                        'Failed to create SELCOM order',

                    raw: orderResponse,

                    data: {
                        status: 'FAILED',
                        reference: orderId,
                    },
                };
            }

            // ========================================================
            // STEP 2: WALLET / SELCOMPESA PAYMENT
            // ========================================================

            const paymentMethod =
                String(
                    (data as any).payment_method ||
                    (data as any).paymentMethod ||
                    'wallet',
                ).toLowerCase();

            const paymentPath =
                paymentMethod === 'selcompesa'
                    ? '/v1/checkout/selcompesa-payment'
                    : '/v1/checkout/wallet-payment';

            /**
             * SELCOM wallet-payment checkpoint:
             *
             * {
             *   transid,
             *   order_id,
             *   msisdn
             * }
             */

            const paymentData = {
                transid: orderId,

                order_id: orderId,

                msisdn: buyerPhone,
            };

            this.logger.log(
                `Triggering SELCOM payment: ${paymentPath}`,
            );

            this.logger.debug(
                `SELCOM payment payload: ${JSON.stringify(
                    {
                        ...paymentData,

                        msisdn:
                            `${buyerPhone.substring(0, 6)}******`,
                    },
                )}`,
            );

            const paymentResponse =
                await client.postFunc(
                    paymentPath,
                    paymentData,
                );

            this.logger.log(
                `SELCOM payment response: ${JSON.stringify(
                    paymentResponse,
                )}`,
            );

            // ========================================================
            // PAYMENT PENDING
            // ========================================================

            /**
             * SELCOM resultcode 111 means:
             *
             * Request accepted / pending.
             *
             * It DOES NOT mean payment is completed.
             */

            if (
                paymentResponse?.resultcode === '111' ||
                paymentResponse?.result === 'PENDING'
            ) {
                return {
                    success: true,

                    transactionId: orderId,

                    message:
                        paymentResponse?.message ||
                        'Payment request sent. Waiting for customer confirmation.',

                    raw: paymentResponse,

                    data: {
                        status: 'PENDING',

                        reference: orderId,
                    },
                };
            }

            // ========================================================
            // PAYMENT FAILED
            // ========================================================

            return {
                success: false,

                transactionId: orderId,

                message:
                    paymentResponse?.message ||
                    'SELCOM payment request failed',

                raw: paymentResponse,

                data: {
                    status: 'FAILED',

                    reference: orderId,
                },
            };
        } catch (error: any) {
            this.logger.error(
                'SELCOM initiate payment failed',
                error?.stack || error,
            );

            return {
                success: false,

                message:
                    error?.response?.data?.message ||
                    error?.message ||
                    'SELCOM payment initiation failed',

                raw:
                    error?.response?.data ||
                    error?.message,
            };
        }
    }

    // ============================================================
    // GET BUYER NAME
    // ============================================================

    private getBuyerName(
        data: InitiatePaymentInput,
    ): string {
        if (data.customer?.name) {
            return data.customer.name;
        }

        const firstName =
            data.customer?.firstname || '';

        const lastName =
            data.customer?.lastname || '';

        return `${firstName} ${lastName}`.trim();
    }

    // ============================================================
    // NORMALIZE PHONE
    // ============================================================

    private normalizePhone(
        phone: string,
    ): string {
        if (!phone) {
            return '';
        }

        let value = String(phone)
            .trim()
            .replace(/\s+/g, '')
            .replace(/-/g, '');

        // +255714059160
        if (value.startsWith('+')) {
            value = value.substring(1);
        }

        // 00255714059160
        if (value.startsWith('00')) {
            value = value.substring(2);
        }

        // 0714059160
        if (value.startsWith('0')) {
            value = `255${value.substring(1)}`;
        }

        // 714059160
        if (
            !value.startsWith('255') &&
            /^[67]\d{8}$/.test(value)
        ) {
            value = `255${value}`;
        }

        return value;
    }

    // ============================================================
    // CHECK CREATE ORDER RESPONSE
    // ============================================================

    private isOrderCreated(
        response: any,
    ): boolean {
        if (!response) {
            return false;
        }

        return (
            response.result === 'SUCCESS' ||
            response.result === 'SUCCESSFUL' ||
            response.resultcode === '000' ||
            response.resultcode === '00'
        );
    }

    // ============================================================
    // VERIFY PAYMENT
    // ============================================================

    async verify(
        data: VerifyPaymentInput,
    ): Promise<PaymentProviderResponse> {
        try {
            const client = this.getClient();

            const reference = data.reference;

            if (!reference) {
                return {
                    success: false,

                    message:
                        'Payment reference is required',
                };
            }

            this.logger.log(
                `Checking SELCOM order status: ${reference}`,
            );

            const statusResponse =
                await client.postFunc(
                    '/v1/checkout/order-status',
                    {
                        vendor: this.vendor,

                        order_id: reference,
                    },
                );

            this.logger.log(
                `SELCOM status response: ${JSON.stringify(
                    statusResponse,
                )}`,
            );

            const success =
                this.isPaymentSuccessful(
                    statusResponse,
                );

            return {
                success,

                transactionId: reference,

                message:
                    statusResponse?.message ||
                    'SELCOM payment status received',

                raw: statusResponse,

                data: {
                    reference,

                    status:
                        this.getPaymentStatus(
                            statusResponse,
                        ),
                },
            };
        } catch (error: any) {
            this.logger.error(
                'SELCOM verify failed',
                error?.stack || error,
            );

            return {
                success: false,

                message:
                    error?.response?.data?.message ||
                    error?.message ||
                    'Failed to verify SELCOM payment',

                raw:
                    error?.response?.data ||
                    error?.message,
            };
        }
    }

    // ============================================================
    // CANCEL ORDER
    // ============================================================

    async cancelOrder(
        reference: string,
    ): Promise<PaymentProviderResponse> {
        try {
            const client = this.getClient();

            this.logger.log(
                `Cancelling SELCOM order: ${reference}`,
            );

            const response =
                await client.postFunc(
                    '/v1/checkout/cancel-order',
                    {
                        vendor: this.vendor,

                        order_id: reference,
                    },
                );

            return {
                success:
                    response?.result === 'SUCCESS' ||
                    response?.result === 'SUCCESSFUL' ||
                    response?.resultcode === '000' ||
                    response?.resultcode === '00',

                transactionId: reference,

                message:
                    response?.message ||
                    'SELCOM order cancellation request completed',

                raw: response,

                data: {
                    reference,
                },
            };
        } catch (error: any) {
            this.logger.error(
                'SELCOM cancel order failed',
                error?.stack || error,
            );

            return {
                success: false,

                transactionId: reference,

                message:
                    error?.response?.data?.message ||
                    error?.message ||
                    'Failed to cancel SELCOM order',

                raw:
                    error?.response?.data ||
                    error?.message,
            };
        }
    }

    // ============================================================
    // PAYMENT SUCCESS
    // ============================================================

    private isPaymentSuccessful(
        response: any,
    ): boolean {
        if (!response) {
            return false;
        }

        /**
         * IMPORTANT:
         * 111/PENDING is not successful.
         */

        if (
            response.result === 'PENDING' ||
            response.resultcode === '111'
        ) {
            return false;
        }

        return (
            response.result === 'SUCCESS' ||
            response.result === 'SUCCESSFUL' ||
            response.resultcode === '000' ||
            response.resultcode === '00'
        );
    }

    // ============================================================
    // PAYMENT STATUS
    // ============================================================

    private getPaymentStatus(
        response: any,
    ): string {
        if (!response) {
            return 'UNKNOWN';
        }

        if (
            response.result === 'PENDING' ||
            response.resultcode === '111'
        ) {
            return 'PENDING';
        }

        if (
            this.isPaymentSuccessful(response)
        ) {
            return 'SUCCESS';
        }

        return 'FAILED';
    }

    // ============================================================
    // LIST PAYMENTS
    // ============================================================

    async listPayments(
        data: ListPaymentsInput,
    ): Promise<ListPaymentsResponse> {
        return {
            success: false,

            data: {
                payments: [],

                total: 0,

                limit: data.limit,

                offset: data.offset,
            },

            message:
                'SELCOM listPayments is not supported',
        };
    }

    // ============================================================
    // BALANCE
    // ============================================================

    async getBalance(): Promise<BalanceResponse> {
        return {
            success: false,

            data: {
                balance: 0,

                currency: 'TZS',

                available: 0,

                pending: 0,

                updated_at:
                    new Date().toISOString(),
            },

            message:
                'SELCOM getBalance is not supported',
        };
    }

    // ============================================================
    // SEARCH PAYMENTS
    // ============================================================

    async searchPayments(
        data: SearchPaymentsInput,
    ): Promise<SearchPaymentsResponse> {
        return {
            success: false,

            data: {
                payments: [],
            },

            message:
                `SELCOM searchPayments is not supported for ${data.reference}`,
        };
    }

    // ============================================================
    // USSD PUSH
    // ============================================================

    async triggerUssdPush(
        data: TriggerUssdPushInput,
    ): Promise<TriggerUssdPushResponse> {
        return {
            success: false,

            data: {
                status: 'UNSUPPORTED',

                message:
                    'Use initiate() to trigger SELCOM wallet payment',

                reference: data.reference,
            },

            message:
                'SELCOM triggerUssdPush is not supported separately',
        };
    }
}