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

// IMPORTANT:
// SELCOM package export is apigwClient
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
            this.configService.get<string>(
                'SELCOM_VENDOR',
            ) || '';

        this.apiKey =
            this.configService.get<string>(
                'SELCOM_API_KEY',
            ) || '';

        this.apiSecret =
            this.configService.get<string>(
                'SELCOM_API_SECRET',
            ) || '';

        /*
         * IMPORTANT:
         *
         * Base URL should NOT contain /v1
         *
         * Correct:
         * https://apigw.selcommobile.com
         *
         * Paths below contain:
         * /v1/checkout/...
         */
        this.baseUrl =
            this.configService.get<string>(
                'SELCOM_BASE_URL',
            ) ||
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


        this.logger.log(
            `SELCOM provider initialized. Base URL: ${this.baseUrl}`,
        );

        this.logger.log(
            `SELCOM vendor: ${this.vendor}`,
        );
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

            const orderId =
                data.order_id;


            // ----------------------------------------------------
            // VALIDATION
            // ----------------------------------------------------

            if (!orderId) {

                return {
                    success: false,
                    message: 'order_id is required',
                };
            }


            if (!data.buyer_phone) {

                return {
                    success: false,
                    message: 'buyer_phone is required',
                };
            }


            if (
                data.amount === undefined ||
                data.amount === null ||
                Number(data.amount) <= 0
            ) {

                return {
                    success: false,
                    message: 'amount must be greater than 0',
                };
            }


            if (!this.vendor) {

                return {
                    success: false,
                    message: 'SELCOM_VENDOR is not configured',
                };
            }


            // ----------------------------------------------------
            // NORMALIZE PHONE
            // ----------------------------------------------------

            const buyerPhone =
                this.normalizePhone(
                    data.buyer_phone,
                );


            if (!buyerPhone) {

                return {
                    success: false,
                    message: 'Invalid buyer phone number',
                };
            }


            // ----------------------------------------------------
            // ORDER DATA
            // ----------------------------------------------------

            const orderData = {

                vendor:
                    data.vendor ||
                    this.vendor,

                order_id:
                    orderId,

                buyer_email:
                    data.buyer_email || '',

                buyer_name:
                    data.buyer_name || '',

                buyer_phone:
                    buyerPhone,

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

                // ...(data.redirect_url && {
                //     redirect_url:
                //         data.redirect_url,
                // }),

                // ...(data.cancel_url && {
                //     cancel_url:
                //         data.cancel_url,
                // }),
                ...(data.webhook && {
                    webhook: Buffer.from(
                        data.webhook,
                        'utf8',
                    ).toString('base64'),
                }),

                // ...(data.webhook && {
                //     webhook:
                //         data.webhook,
                // }),
            };


            // ----------------------------------------------------
            // URL
            // ----------------------------------------------------

            const configuredUrl =
                this.configService.get<string>(
                    'SELCOM_CREATE_ORDER_URL',
                );


            let orderPath =
                '/v1/checkout/create-order-minimal';


            if (configuredUrl) {

                try {

                    orderPath =
                        new URL(
                            configuredUrl,
                        ).pathname;

                } catch {

                    this.logger.warn(
                        `Invalid SELCOM_CREATE_ORDER_URL: ${configuredUrl}`,
                    );
                }
            }


            // ----------------------------------------------------
            // LOG
            // ----------------------------------------------------

            this.logger.log(
                `Creating SELCOM order: ${orderId}`,
            );

            this.logger.log(
                `SELCOM create order path: ${orderPath}`,
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
                            ? `${orderData.buyer_phone.substring(
                                0,
                                6,
                            )}******`
                            : '',

                })}`,
            );


            // ----------------------------------------------------
            // CREATE ORDER
            // ----------------------------------------------------

            const response =
                await client.postFunc(
                    orderPath,
                    orderData,
                );


            // ----------------------------------------------------
            // RESPONSE
            // ----------------------------------------------------

            this.logger.log(
                `SELCOM create order response: ${JSON.stringify(
                    response,
                )}`,
            );


            const success =
                this.isOrderCreated(
                    response,
                );


            this.logger.log(
                `SELCOM order created: ${success}`,
            );

            this.logger.log(
                `SELCOM order resultcode: ${response?.resultcode || ''
                }`,
            );

            this.logger.log(
                `SELCOM order result: ${response?.result || ''
                }`,
            );


            // ----------------------------------------------------
            // SELCOM DATA
            // ----------------------------------------------------

            const responseData =
                Array.isArray(response?.data)
                    ? response.data[0]
                    : response?.data;


            return {

                success,

                transactionId:
                    response?.reference ||
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
                        response?.reference ||
                        orderId,

                    order_id:
                        orderId,

                    result:
                        response?.result,

                    resultcode:
                        response?.resultcode,

                    payment_token:
                        responseData?.payment_token,

                    payment_gateway_url:
                        responseData?.payment_gateway_url,

                    qr:
                        responseData?.qr,
                },
            };

        } catch (error: any) {

            this.logger.error(
                `SELCOM create order failed: ${error?.message ||
                error
                }`,
                error?.stack,
            );


            this.logger.error(
                `SELCOM create order error response: ${JSON.stringify(
                    error?.response?.data ||
                    error?.response ||
                    {},
                )}`,
            );


            return {

                success: false,

                transactionId:
                    data?.order_id,

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

            const client =
                this.getClient();


            const orderId =
                data.order_id;


            const msisdn =
                this.normalizePhone(
                    data.msisdn,
                );


            // ----------------------------------------------------
            // VALIDATION
            // ----------------------------------------------------

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


            // ----------------------------------------------------
            // PAYMENT DATA
            // ----------------------------------------------------

            const paymentData = {

                transid:
                    data.transid ||
                    orderId,

                order_id:
                    orderId,

                msisdn,
            };


            // ----------------------------------------------------
            // LOG
            // ----------------------------------------------------

            this.logger.log(
                `Executing SELCOM payment: ${paymentPath}`,
            );


            this.logger.debug(
                `SELCOM payment payload: ${JSON.stringify({

                    ...paymentData,

                    msisdn:
                        `${msisdn.substring(
                            0,
                            6,
                        )}******`,

                })}`,
            );


            // ----------------------------------------------------
            // REQUEST
            // ----------------------------------------------------

            const response =
                await client.postFunc(
                    paymentPath,
                    paymentData,
                );


            // ----------------------------------------------------
            // RESPONSE
            // ----------------------------------------------------

            this.logger.log(
                `SELCOM payment response: ${JSON.stringify(
                    response,
                )}`,
            );


            const pending =
                this.isPaymentPending(
                    response,
                );


            const success =
                this.isPaymentSuccessful(
                    response,
                );


            const status =
                this.getPaymentStatus(
                    response,
                );


            this.logger.log(
                `SELCOM wallet payment status: ${status}`,
            );

            this.logger.log(
                `SELCOM wallet payment successful: ${success}`,
            );


            return {

                /*
                 * For a wallet push:
                 *
                 * PENDING/INPROGRESS means the request was
                 * accepted but payment is not completed yet.
                 *
                 * We therefore return success=true for an
                 * initiated/pending request so the frontend
                 * can tell the user to confirm the payment.
                 */
                success:
                    success ||
                    pending,

                transactionId:
                    response?.reference ||
                    response?.transid ||
                    orderId,

                message:
                    response?.message ||
                    (
                        pending
                            ? 'Payment request sent. Waiting for customer confirmation.'
                            : success
                                ? 'SELCOM payment completed'
                                : 'SELCOM payment failed'
                    ),

                raw:
                    response,

                data: {

                    status,

                    reference:
                        response?.reference ||
                        orderId,

                    transid:
                        response?.transid ||
                        orderId,

                    order_id:
                        response?.order_id ||
                        orderId,

                    result:
                        response?.result,

                    resultcode:
                        response?.resultcode,

                    payment_status:
                        response?.payment_status,
                },
            };

        } catch (error: any) {

            this.logger.error(
                `SELCOM wallet payment failed: ${error?.message ||
                error
                }`,
                error?.stack,
            );


            this.logger.error(
                `SELCOM wallet payment error response: ${JSON.stringify(
                    error?.response?.data ||
                    error?.response ||
                    {},
                )}`,
            );


            return {

                success: false,

                transactionId:
                    data?.order_id,

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


            const orderStatusPath =
                '/v1/checkout/order-status';


            this.logger.debug(
                `SELCOM order status method: GET`,
            );


            this.logger.debug(
                `SELCOM order status path: ${orderStatusPath}`,
            );


            this.logger.debug(
                `SELCOM order status request: ${JSON.stringify({
                    order_id: reference,
                })}`,
            );


            // IMPORTANT:
            // SELCOM order-status uses GET
            const response =
                await client.getFunc(
                    orderStatusPath,
                    {
                        order_id:
                            reference,
                    },
                );


            this.logger.log(
                `SELCOM order status response: ${JSON.stringify(
                    response,
                )}`,
            );


            const isSuccess =
                this.isPaymentSuccessful(
                    response,
                );


            const status =
                this.getPaymentStatus(
                    response,
                );


            const paymentStatus =
                this.extractPaymentStatus(
                    response,
                );


            this.logger.log(
                `SELCOM payment status: ${status}`,
            );


            this.logger.log(
                `SELCOM payment_status: ${paymentStatus || 'N/A'
                }`,
            );


            this.logger.log(
                `SELCOM payment successful: ${isSuccess}`,
            );


            return {

                success:
                    isSuccess,

                transactionId:
                    response?.reference ||
                    response?.transid ||
                    reference,

                message:
                    response?.message ||
                    'SELCOM order status received',

                raw:
                    response,

                data: {

                    reference,

                    order_id:
                        response?.order_id ||
                        reference,

                    status,

                    payment_status:
                        paymentStatus,

                    result:
                        response?.result,

                    resultcode:
                        response?.resultcode,

                    transid:
                        response?.transid,

                },
            };

        } catch (error: any) {

            this.logger.error(
                `SELCOM order status failed: ${error?.message ||
                error
                }`,
                error?.stack,
            );


            this.logger.error(
                `SELCOM order status error response: ${JSON.stringify(
                    error?.response?.data ||
                    error?.response ||
                    {},
                )}`,
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


            const buyerPhone =
                this.normalizePhone(
                    data.customer?.phone ||
                    data.phone,
                );


            const amount =
                Number(data.amount);


            if (!orderId) {

                return {

                    success: false,

                    message:
                        'Payment reference is required',
                };
            }


            if (!buyerPhone) {

                return {

                    success: false,

                    message:
                        'Customer phone is required',
                };
            }


            if (
                !amount ||
                amount <= 0
            ) {

                return {

                    success: false,

                    message:
                        'Payment amount must be greater than 0',
                };
            }


            // ====================================================
            // WEBHOOK URL
            // ====================================================

            const webhook =
                data.callbackUrl ||
                this.configService.get<string>(
                    'PAYMENT_CALLBACK_URL',
                );


            this.logger.log(
                `SELCOM payment webhook: ${webhook || 'NOT CONFIGURED'
                }`,
            );


            // ====================================================
            // STEP 1: CREATE ORDER
            // ====================================================

            const orderResponse =
                await this.createOrder({

                    vendor:
                        this.vendor,

                    order_id:
                        orderId,

                    buyer_email:
                        data.customer?.email ||
                        '',

                    buyer_name:
                        this.getBuyerName(
                            data,
                        ),

                    buyer_phone:
                        buyerPhone,

                    amount,

                    currency:
                        data.currency ||
                        'TZS',

                    buyer_remarks:
                        `eKazi subscription ${orderId}`,

                    merchant_remarks:
                        'eKazi subscription payment',

                    no_of_items:
                        1,

                    // IMPORTANT:
                    // Send callback URL to SELCOM
                    ...(webhook && {
                        webhook,
                    }),
                });


            if (!orderResponse.success) {

                this.logger.error(
                    `SELCOM order creation failed for ${orderId}: ${orderResponse.message
                    }`,
                );

                return orderResponse;
            }


            // ====================================================
            // EXTRACT ORDER RESPONSE DATA
            // ====================================================

            const orderRawData =
                Array.isArray(
                    orderResponse.raw?.data,
                )
                    ? orderResponse.raw.data[0]
                    : orderResponse.raw?.data;


            this.logger.debug(
                `SELCOM order data: ${JSON.stringify(
                    orderRawData || {},
                )}`,
            );


            // ====================================================
            // STEP 2: WALLET PAYMENT
            // ====================================================

            const paymentResponse =
                await this.walletPayment({

                    transid:
                        orderId,

                    order_id:
                        orderId,

                    msisdn:
                        buyerPhone,
                });


            // ====================================================
            // FINAL RESPONSE
            // ====================================================

            return {

                ...paymentResponse,

                data: {

                    ...paymentResponse.data,

                    order_id:
                        orderId,

                    payment_token:
                        orderRawData?.payment_token,

                    payment_gateway_url:
                        orderRawData?.payment_gateway_url,

                    qr:
                        orderRawData?.qr,

                    webhook:
                        webhook,
                },
            };

        } catch (error: any) {

            this.logger.error(
                `SELCOM initiate payment failed: ${error?.message ||
                error
                }`,
                error?.stack,
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

        if (
            data.customer?.name
        ) {

            return data.customer.name;
        }


        const firstName =
            data.customer?.firstname ||
            '';


        const lastName =
            data.customer?.lastname ||
            '';


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


        // +255...
        if (
            value.startsWith('+')
        ) {

            value =
                value.substring(1);
        }


        // 00255...
        if (
            value.startsWith('00')
        ) {

            value =
                value.substring(2);
        }


        // 0712345678 -> 255712345678
        if (
            value.startsWith('0')
        ) {

            value =
                `255${value.substring(1)}`;
        }


        // 712345678 -> 255712345678
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

            response.result ===
            'SUCCESS' ||

            response.result ===
            'SUCCESSFUL' ||

            response.resultcode ===
            '000' ||

            response.resultcode ===
            '00'
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


            if (!reference) {

                return {

                    success: false,

                    message:
                        'Payment reference is required',
                };
            }


            this.logger.log(
                `Cancelling SELCOM order: ${reference}`,
            );


            /*
             * SELCOM cancel-order uses DELETE.
             *
             * If your installed SDK does not expose
             * deleteFunc(), check the installed package
             * version before changing this back to postFunc().
             */
            const response =
                await client.deleteFunc(
                    '/v1/checkout/cancel-order',
                    {
                        order_id:
                            reference,
                    },
                );


            this.logger.log(
                `SELCOM cancel order response: ${JSON.stringify(
                    response,
                )}`,
            );


            const success =
                response?.result === 'SUCCESS' ||
                response?.result === 'SUCCESSFUL' ||
                response?.resultcode === '000' ||
                response?.resultcode === '00';


            return {

                success,

                transactionId:
                    response?.reference ||
                    reference,

                message:
                    response?.message ||
                    (
                        success
                            ? 'SELCOM order cancelled successfully'
                            : 'Failed to cancel SELCOM order'
                    ),

                raw:
                    response,

                data: {

                    reference,

                    result:
                        response?.result,

                    resultcode:
                        response?.resultcode,
                },
            };

        } catch (error: any) {

            this.logger.error(
                `SELCOM cancel order failed: ${error?.message ||
                error
                }`,
                error?.stack,
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
    // EXTRACT PAYMENT STATUS
    // ============================================================

    private extractPaymentStatus(
        response: any,
    ): string {

        if (!response) {
            return '';
        }


        /*
         * SELCOM webhook/order status can expose
         * payment_status at different levels.
         */

        const status =
            response?.payment_status ||
            response?.data?.payment_status ||
            response?.data?.[0]?.payment_status;


        if (!status) {
            return '';
        }


        return String(
            status,
        ).toUpperCase();
    }


    // ============================================================
    // CHECK PAYMENT PENDING
    // ============================================================

    // private isPaymentPending(
    //     response: any,
    // ): boolean {

    //     if (!response) {
    //         return false;
    //     }


    //     const paymentStatus =
    //         this.extractPaymentStatus(
    //             response,
    //         );


    //     if (
    //         paymentStatus === 'PENDING' ||
    //         paymentStatus === 'INPROGRESS'
    //     ) {

    //         return true;
    //     }


    //     return (
    //         response?.result ===
    //         'PENDING' ||

    //         response?.resultcode ===
    //         '111'
    //     );
    // }
    private isPaymentPending(
        response: any,
    ): boolean {

        if (!response) {
            return false;
        }

        const paymentStatus =
            this.extractPaymentStatus(
                response,
            );

        // Explicit payment pending states
        if (
            paymentStatus === 'PENDING' ||
            paymentStatus === 'INPROGRESS'
        ) {
            return true;
        }

        // SELCOM wallet push accepted.
        // Payment has NOT yet been completed.
        if (
            response?.resultcode === '000' &&
            (
                response?.result === 'SUCCESS' ||
                response?.result === 'SUCCESSFUL'
            )
        ) {
            return true;
        }

        return (
            response?.result === 'PENDING' ||
            response?.resultcode === '111'
        );
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


        /*
         * IMPORTANT:
         *
         * For final payment verification,
         * payment_status=COMPLETED is the authoritative
         * payment completion indicator.
         */

        const paymentStatus =
            this.extractPaymentStatus(
                response,
            );


        if (paymentStatus) {

            return (
                paymentStatus ===
                'COMPLETED'
            );
        }


        /*
         * Do NOT treat resultcode=000 as a completed
         * customer payment when checking order status.
         *
         * 000 can mean the API request itself was successful.
         */

        return false;
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


        const paymentStatus =
            this.extractPaymentStatus(
                response,
            );


        // -----------------------------------------
        // FINAL SELCOM PAYMENT STATUS
        // -----------------------------------------

        if (paymentStatus) {

            return paymentStatus;
        }


        // -----------------------------------------
        // API PENDING
        // -----------------------------------------

        if (
            response?.result ===
            'PENDING' ||

            response?.resultcode ===
            '111'
        ) {

            return 'PENDING';
        }


        // -----------------------------------------
        // API REQUEST SUCCESSFUL
        // BUT PAYMENT NOT CONFIRMED
        // -----------------------------------------

        // if (
        //     response?.result ===
        //     'SUCCESS' ||

        //     response?.result ===
        //     'SUCCESSFUL' ||

        //     response?.resultcode ===
        //     '000' ||

        //     response?.resultcode ===
        //     '00'
        // ) {

        //     return 'INITIATED';
        // }
        if (
            response?.result === 'SUCCESS' ||
            response?.result === 'SUCCESSFUL' ||
            response?.resultcode === '000' ||
            response?.resultcode === '00'
        ) {
            return 'PENDING';
        }


        return 'FAILED';
    }
    // ============================================================
    // LIST SELCOM ORDERS
    // ============================================================

    async listOrders(
        fromdate: string,
        todate: string,
    ): Promise<PaymentProviderResponse> {

        try {
            const client = this.getClient();

            if (!fromdate) {
                return {
                    success: false,
                    message: 'fromdate is required',
                };
            }

            if (!todate) {
                return {
                    success: false,
                    message: 'todate is required',
                };
            }

            // Validate date format
            const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

            if (!dateRegex.test(fromdate)) {
                return {
                    success: false,
                    message: 'fromdate must be in YYYY-MM-DD format',
                };
            }

            if (!dateRegex.test(todate)) {
                return {
                    success: false,
                    message: 'todate must be in YYYY-MM-DD format',
                };
            }

            const listOrdersPath =
                '/v1/checkout/list-orders';

            const requestData = {
                fromdate,
                todate,
            };

            this.logger.log(
                `Getting SELCOM orders from ${fromdate} to ${todate}`,
            );

            this.logger.debug(
                `SELCOM list orders path: ${listOrdersPath}`,
            );

            this.logger.debug(
                `SELCOM list orders request: ${JSON.stringify(
                    requestData,
                )}`,
            );

            // SELCOM list-orders uses GET
            const response =
                await client.getFunc(
                    listOrdersPath,
                    requestData,
                );

            this.logger.log(
                `SELCOM list orders response: ${JSON.stringify(
                    response,
                )}`,
            );

            const success =
                response?.result === 'SUCCESS' ||
                response?.result === 'SUCCESSFUL' ||
                response?.resultcode === '000' ||
                response?.resultcode === '00';

            // SELCOM may return data as an array
            const orders =
                Array.isArray(response?.data)
                    ? response.data
                    : response?.data
                        ? [response.data]
                        : [];

            return {
                success,

                message:
                    response?.message ||
                    (
                        success
                            ? 'SELCOM orders retrieved successfully'
                            : 'Failed to retrieve SELCOM orders'
                    ),

                data: {
                    orders,
                    total: orders.length,
                    fromdate,
                    todate,
                },

                raw: response,
            };

        } catch (error: any) {

            this.logger.error(
                `SELCOM list orders failed: ${error?.message || error
                }`,
                error?.stack,
            );

            this.logger.error(
                `SELCOM list orders error response: ${JSON.stringify(
                    error?.response?.data ||
                    error?.response ||
                    {},
                )
                }`,
            );

            return {
                success: false,

                message:
                    error?.response?.data?.message ||
                    error?.message ||
                    'Failed to retrieve SELCOM orders',

                data: {
                    orders: [],
                    total: 0,
                    fromdate,
                    todate,
                },

                raw:
                    error?.response?.data ||
                    error?.message,
            };
        }
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