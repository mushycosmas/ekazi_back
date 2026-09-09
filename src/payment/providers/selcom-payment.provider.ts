import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import {
    SelcomProvider,
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
    SelcomOrderInput,
    SelcomWalletPaymentInput,
} from '../interfaces/payment-provider.interface';

const { apigwCLient } = require('selcom-apigw-client');


@Injectable()
export class SelcomPaymentProvider implements SelcomProvider {

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
            'https://apigw.selcommobile.com/v1';


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
    // CREATE ORDER
    // ============================================================

    async createOrder(
        data: SelcomOrderInput,
    ): Promise<PaymentProviderResponse> {

        try {

            const client = this.getClient();

            const orderId = data.order_id;

            if (!orderId) {

                return {
                    success: false,
                    message: 'order_id is required',
                };

            }


            const orderData = {

                vendor:
                    data.vendor || this.vendor,

                order_id:
                    data.order_id,

                buyer_email:
                    data.buyer_email,

                buyer_name:
                    data.buyer_name,

                buyer_phone:
                    this.normalizePhone(
                        data.buyer_phone,
                    ),

                amount:
                    Number(data.amount),

                currency:
                    data.currency || 'TZS',

                ...(data.buyer_remarks && {
                    buyer_remarks:
                        data.buyer_remarks,
                }),

                ...(data.merchant_remarks && {
                    merchant_remarks:
                        data.merchant_remarks,
                }),

                ...(data.no_of_items !== undefined && {
                    no_of_items:
                        data.no_of_items,
                }),

                ...(data.redirect_url && {
                    redirect_url:
                        data.redirect_url,
                }),

                ...(data.cancel_url && {
                    cancel_url:
                        data.cancel_url,
                }),

                ...(data.webhook && {
                    webhook:
                        data.webhook,
                }),
            };


            this.logger.log(
                `Creating SELCOM order: ${orderId}`,
            );


            this.logger.debug(
                `SELCOM create order payload: ${JSON.stringify({
                    ...orderData,

                    buyer_email:
                        orderData.buyer_email
                            ? '***'
                            : '',

                    buyer_phone:
                        orderData.buyer_phone
                            ? `${orderData.buyer_phone.substring(0, 6)}******`
                            : '',
                })}`,
            );


            const configuredUrl =
                this.configService.get<string>(
                    'SELCOM_CREATE_ORDER_URL',
                );


            const orderPath =
                configuredUrl
                    ? new URL(configuredUrl).pathname
                    : '/v1/checkout/create-order-minimal';


            const response =
                await client.postFunc(
                    orderPath,
                    orderData,
                );


            this.logger.log(
                `SELCOM create order response: ${JSON.stringify(
                    response,
                )}`,
            );


            const success =
                this.isOrderCreated(response);


            return {

                success,

                transactionId:
                    orderId,

                message:
                    response?.message ||
                    (
                        success
                            ? 'SELCOM order created successfully'
                            : 'Failed to create SELCOM order'
                    ),

                raw:
                    response,

                data: {
                    status:
                        success
                            ? 'SUCCESS'
                            : 'FAILED',

                    reference:
                        orderId,
                },
            };

        } catch (error: any) {

            this.logger.error(
                'SELCOM create order failed',
                error?.stack || error,
            );


            return {

                success: false,

                message:
                    error?.response?.data?.message ||
                    error?.message ||
                    'SELCOM create order failed',

                raw:
                    error?.response?.data ||
                    error?.message,
            };
        }
    }


    // ============================================================
    // WALLET PAYMENT
    // ============================================================

    async walletPayment(
        data: SelcomWalletPaymentInput,
    ): Promise<PaymentProviderResponse> {

        return this.executeWalletPayment(
            data,
            '/v1/checkout/wallet-payment',
        );
    }


    // ============================================================
    // SELCOMPESA PAYMENT
    // ============================================================

    async selcompesaPayment(
        data: SelcomWalletPaymentInput,
    ): Promise<PaymentProviderResponse> {

        return this.executeWalletPayment(
            data,
            '/v1/checkout/selcompesa-payment',
        );
    }


    // ============================================================
    // EXECUTE WALLET / SELCOMPESA PAYMENT
    // ============================================================

    private async executeWalletPayment(
        data: SelcomWalletPaymentInput,
        paymentPath: string,
    ): Promise<PaymentProviderResponse> {

        try {

            const client = this.getClient();

            const orderId =
                data.order_id;

            const msisdn =
                this.normalizePhone(
                    data.msisdn,
                );


            if (!orderId) {

                return {
                    success: false,
                    message: 'order_id is required',
                };

            }


            if (!msisdn) {

                return {
                    success: false,
                    message: 'msisdn is required',
                };

            }


            const paymentData = {

                transid:
                    data.transid || orderId,

                order_id:
                    orderId,

                msisdn,
            };


            this.logger.log(
                `Executing SELCOM payment: ${paymentPath}`,
            );


            this.logger.debug(
                `SELCOM payment payload: ${JSON.stringify({
                    ...paymentData,

                    msisdn:
                        `${msisdn.substring(0, 6)}******`,
                })}`,
            );


            const response =
                await client.postFunc(
                    paymentPath,
                    paymentData,
                );


            this.logger.log(
                `SELCOM payment response: ${JSON.stringify(
                    response,
                )}`,
            );


            const pending =
                response?.resultcode === '111' ||
                response?.result === 'PENDING';


            const success =
                !pending &&
                (
                    response?.result === 'SUCCESS' ||
                    response?.result === 'SUCCESSFUL' ||
                    response?.resultcode === '000' ||
                    response?.resultcode === '00'
                );


            return {

                success:
                    success || pending,

                // SELCOM's actual reference
                transactionId:
                    response?.reference || orderId,

                message:
                    response?.message ||
                    (
                        pending
                            ? 'Payment request sent. Waiting for customer confirmation.'
                            : success
                                ? 'SELCOM payment successful'
                                : 'SELCOM payment failed'
                    ),

                raw:
                    response,

                data: {

                    status:
                        pending
                            ? 'PENDING'
                            : success
                                ? 'SUCCESS'
                                : 'FAILED',

                    // SELCOM reference
                    reference:
                        response?.reference || orderId,

                    // Our merchant/order ID
                    transid:
                        response?.transid || orderId,
                },
            };

        } catch (error: any) {

            this.logger.error(
                'SELCOM wallet payment failed',
                error?.stack || error,
            );


            return {

                success: false,

                message:
                    error?.response?.data?.message ||
                    error?.message ||
                    'SELCOM payment failed',

                raw:
                    error?.response?.data ||
                    error?.message,
            };
        }
    }


    // ============================================================
    // ORDER STATUS
    // ============================================================

    async orderStatus(
        reference: string,
    ): Promise<PaymentProviderResponse> {

        try {

            const client =
                this.getClient();


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


            const response =
                await client.postFunc(
                    '/v1/checkout/order-status',
                    {
                        vendor:
                            this.vendor,

                        order_id:
                            reference,
                    },
                );


            this.logger.log(
                `SELCOM order status response: ${JSON.stringify(
                    response,
                )}`,
            );


            const success =
                this.isPaymentSuccessful(
                    response,
                );


            return {

                success,

                transactionId:
                    reference,

                message:
                    response?.message ||
                    'SELCOM order status received',

                raw:
                    response,

                data: {

                    reference,

                    status:
                        this.getPaymentStatus(
                            response,
                        ),
                },
            };

        } catch (error: any) {

            this.logger.error(
                'SELCOM order status failed',
                error?.stack || error,
            );


            return {

                success: false,

                transactionId:
                    reference,

                message:
                    error?.response?.data?.message ||
                    error?.message ||
                    'Failed to get SELCOM order status',

                raw:
                    error?.response?.data ||
                    error?.message,
            };
        }
    }


    // ============================================================
    // INITIATE PAYMENT
    // ============================================================

    async initiate(
        data: InitiatePaymentInput,
    ): Promise<PaymentProviderResponse> {

        try {

            const orderId =
                data.reference;


            if (!orderId) {

                throw new Error(
                    'Payment reference/order_id is required',
                );
            }


            const buyerName =
                this.getBuyerName(data);


            const buyerPhone =
                this.normalizePhone(
                    data.customer?.phone ||
                    data.phone,
                );


            if (!buyerPhone) {

                throw new Error(
                    'Buyer phone number is required',
                );
            }


            const amount =
                Number(data.amount);


            if (!amount || amount <= 0) {

                throw new Error(
                    'Payment amount must be greater than zero',
                );
            }


            // ========================================================
            // STEP 1: CREATE ORDER
            // ========================================================

            const orderResponse =
                await this.createOrder({

                    vendor:
                        this.vendor,

                    order_id:
                        orderId,

                    buyer_email:
                        data.customer?.email || '',

                    buyer_name:
                        buyerName,

                    buyer_phone:
                        buyerPhone,

                    amount,

                    currency:
                        data.currency || 'TZS',

                    buyer_remarks:
                        `eKazi subscription ${orderId}`,

                    merchant_remarks:
                        'eKazi subscription payment',

                    no_of_items:
                        1,
                });


            if (!orderResponse.success) {

                return orderResponse;
            }


            // ========================================================
            // STEP 2: PAYMENT
            // ========================================================

            const paymentMethod =
                String(
                    (data as any).payment_method ||
                    (data as any).paymentMethod ||
                    'wallet',
                ).toLowerCase();


            const paymentData: SelcomWalletPaymentInput = {

                transid:
                    orderId,

                order_id:
                    orderId,

                msisdn:
                    buyerPhone,
            };


            const paymentResponse =
                paymentMethod === 'selcompesa'
                    ? await this.selcompesaPayment(
                        paymentData,
                    )
                    : await this.walletPayment(
                        paymentData,
                    );


            return paymentResponse;

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


        let value =
            String(phone)
                .trim()
                .replace(/\s+/g, '')
                .replace(/-/g, '');


        if (value.startsWith('+')) {
            value = value.substring(1);
        }


        if (value.startsWith('00')) {
            value = value.substring(2);
        }


        if (value.startsWith('0')) {
            value =
                `255${value.substring(1)}`;
        }


        if (
            !value.startsWith('255') &&
            /^[67]\d{8}$/.test(value)
        ) {
            value =
                `255${value}`;
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

        return this.orderStatus(
            data.reference,
        );
    }


    // ============================================================
    // CANCEL ORDER
    // ============================================================

    async cancelOrder(
        reference: string,
    ): Promise<PaymentProviderResponse> {

        try {

            const client =
                this.getClient();


            this.logger.log(
                `Cancelling SELCOM order: ${reference}`,
            );


            const response =
                await client.postFunc(
                    '/v1/checkout/cancel-order',
                    {
                        vendor:
                            this.vendor,

                        order_id:
                            reference,
                    },
                );


            return {

                success:
                    response?.result === 'SUCCESS' ||
                    response?.result === 'SUCCESSFUL' ||
                    response?.resultcode === '000' ||
                    response?.resultcode === '00',

                transactionId:
                    reference,

                message:
                    response?.message ||
                    'SELCOM order cancellation request completed',

                raw:
                    response,

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

                transactionId:
                    reference,

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

                limit:
                    data.limit,

                offset:
                    data.offset,
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

                status:
                    'UNSUPPORTED',

                message:
                    'Use initiate() to trigger SELCOM wallet payment',

                reference:
                    data.reference,
            },

            message:
                'SELCOM triggerUssdPush is not supported separately',
        };
    }
}