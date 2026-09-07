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

import * as crypto from 'crypto';

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
export class SelcomPaymentProvider
    implements PaymentProvider {

    private readonly logger =
        new Logger(
            SelcomPaymentProvider.name,
        );


    constructor(
        private readonly httpService: HttpService,

        private readonly configService: ConfigService,
    ) { }


    // ============================================================
    // CONFIGURATION
    // ============================================================

    private getConfig() {

        const vendor =
            this.configService.get<string>(
                'SELCOM_VENDOR',
            );

        const apiKey =
            this.configService.get<string>(
                'SELCOM_API_KEY',
            );

        const apiSecret =
            this.configService.get<string>(
                'SELCOM_API_SECRET',
            );

        const callbackUrl =
            this.configService.get<string>(
                'PAYMENT_CALLBACK_URL',
            );

        this.logger.debug(`SELCOM Vendor: ${vendor}`);
        this.logger.debug(`SELCOM API Key: ${apiKey?.substring(0, 4)}...${apiKey?.substring(apiKey?.length - 4)}`);
        this.logger.debug(`SELCOM API Secret: ${apiSecret?.substring(0, 4)}...${apiSecret?.substring(apiSecret?.length - 4)}`);

        if (!vendor || !apiKey || !apiSecret) {
            throw new InternalServerErrorException(
                'Selcom configuration is missing. Required: SELCOM_VENDOR, SELCOM_API_KEY, SELCOM_API_SECRET',
            );
        }

        return {
            vendor,
            apiKey,
            apiSecret,
            callbackUrl,
        };
    }


    // ============================================================
    // GENERATE TIMESTAMP
    // ============================================================

    private getTimestamp(): string {
        const now = new Date();

        // Selcom expects: YYYY-MM-DDTHH:mm:ss+03:00
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');

        return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}+03:00`;
    }


    // ============================================================
    // CREATE SELCOM DIGEST
    // ============================================================

    private generateDigest(
        apiSecret: string,
        timestamp: string,
        data: Record<string, any>,
        signedFields: string[],
    ): string {
        // IMPORTANT: Fields must be in the EXACT order as Signed-Fields
        // Do NOT sort alphabetically!
        const fields = signedFields
            .filter(field => {
                const value = this.getNestedValue(data, field);
                return value !== undefined && value !== null && value !== '';
            })
            .map(field => {
                const value = this.getNestedValue(data, field);
                return `${field}=${value}`;
            });

        // timestamp MUST come first
        const stringToSign = [
            `timestamp=${timestamp}`,
            ...fields,
        ].join('&');

        this.logger.debug(
            `SELCOM String To Sign: ${stringToSign}`,
        );

        // Generate HMAC-SHA256 digest
        const digest = crypto
            .createHmac('sha256', apiSecret)
            .update(stringToSign, 'utf8')
            .digest('base64');

        this.logger.debug(`SELCOM Generated Digest: ${digest}`);

        return digest;
    }


    // ============================================================
    // HELPER METHOD TO GET NESTED OBJECT VALUES
    // ============================================================

    private getNestedValue(obj: any, path: string): any {
        return path.split('.').reduce((current, key) => {
            return current && current[key] !== undefined ? current[key] : undefined;
        }, obj);
    }


    // ============================================================
    // INITIATE PAYMENT - THE FINAL WORKING VERSION
    // ============================================================

    async initiate(
    data: InitiatePaymentInput,
): Promise<PaymentProviderResponse> {

    const createOrderUrl =
        this.configService.get<string>(
            'SELCOM_CREATE_ORDER_URL',
        );

    const walletPaymentUrl =
        this.configService.get<string>(
            'SELCOM_WALLET_PAYMENT_URL',
        );

    const pesaPaymentUrl =
        this.configService.get<string>(
            'SELCOM_PESA_PAYMENT_URL',
        );

    const {
        vendor,
        apiKey,
        apiSecret,
        callbackUrl,
    } = this.getConfig();

    if (!createOrderUrl) {
        throw new InternalServerErrorException(
            'SELCOM_CREATE_ORDER_URL is missing',
        );
    }

    try {
        this.logger.log(
            `Initiating Selcom payment: ${data.reference}`,
        );

        const timestamp =
            this.getTimestamp();

        // Format phone number
        let buyerPhone = data.phone
            ?.trim()
            .replace(/\s+/g, '');

        if (buyerPhone) {
            if (buyerPhone.startsWith('0')) {
                buyerPhone = '255' + buyerPhone.substring(1);
            } else if (!buyerPhone.startsWith('255')) {
                buyerPhone = '255' + buyerPhone;
            }
        }

        const buyerName =
            [
                data.customer?.firstname,
                data.customer?.lastname,
            ]
                .filter(Boolean)
                .join(' ')
                .trim() || 'Customer';

        const webhookUrl =
            data.callbackUrl ||
            callbackUrl;

        // Webhook must be base64 encoded
        const encodedWebhook = webhookUrl 
            ? Buffer.from(webhookUrl).toString('base64')
            : '';

        // ============================================================
        // STEP 1: Create Order
        // ============================================================

        const orderData: Record<string, any> = {
            vendor: vendor,
            order_id: data.reference,
            buyer_email: data.customer?.email || '',
            buyer_name: buyerName,
            buyer_phone: buyerPhone || '',
            amount: Number(data.amount),
            currency: data.currency || 'TZS',
            payment_methods: 'ALL',
            webhook: encodedWebhook,
            buyer_remarks: `eKazi subscription ${data.reference}`,
            merchant_remarks: 'eKazi subscription payment',
            no_of_items: 1
        };

        // Remove empty fields
        Object.keys(orderData).forEach(key => {
            if (orderData[key] === '' || orderData[key] === null || orderData[key] === undefined) {
                delete orderData[key];
            }
        });

        const signedFields = [
            'vendor', 'order_id', 'buyer_email', 'buyer_name', 'buyer_phone',
            'amount', 'currency', 'payment_methods', 'webhook',
            'buyer_remarks', 'merchant_remarks', 'no_of_items'
        ].filter(field => {
            const value = this.getNestedValue(orderData, field);
            return value !== undefined && value !== null && value !== '';
        });

        // Generate digest for create order
        const orderDigest = this.generateDigest(
            apiSecret,
            timestamp,
            orderData,
            signedFields,
        );

        const headers = {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `SELCOM ${apiKey}`,
            'Digest-Method': 'HS256',
            'Digest': orderDigest,
            'Timestamp': timestamp,
            'Signed-Fields': signedFields.join(','),
        };

        this.logger.debug(`STEP 1: Creating order...`);
        this.logger.debug(`Order Data: ${JSON.stringify(orderData)}`);

        const createResponse =
            await firstValueFrom(
                this.httpService.post(
                    createOrderUrl,
                    orderData,
                    {
                        headers,
                        timeout: 30000,
                    },
                ),
            );

        const createResult = createResponse.data;

        this.logger.log(
            `STEP 1 Response: ${JSON.stringify(createResult)}`,
        );

        // Check if order creation was successful
        if (createResult?.resultcode !== '000' || createResult?.result !== 'SUCCESS') {
            return {
                success: false,
                message: createResult?.message || 'Order creation failed',
                raw: createResult,
                data: createResult,
            };
        }

        // Get the order reference
        const orderReference = createResult?.reference || createResult?.data?.[0]?.reference || data.reference;

        this.logger.log(`Order created successfully. Reference: ${orderReference}`);

        // ============================================================
        // STEP 2: Initiate Payment (Wallet or SelcomPesa)
        // ============================================================

        // Determine which payment method to use
        // Default to wallet payment
        const paymentUrl = walletPaymentUrl || pesaPaymentUrl;

        if (!paymentUrl) {
            this.logger.warn('No payment URL configured. Order created but payment not initiated.');
            return {
                success: true,
                transactionId: orderReference,
                raw: createResult,
                data: createResult,
                message: 'Order created. Please initiate payment manually.',
            };
        }

        // Build payment request
        const paymentData: Record<string, any> = {
            vendor: vendor,
            transid: orderReference,
            amount: Number(data.amount),
            msisdn: buyerPhone || '',
            reference: data.reference,
        };

        // For wallet payment, we might need pin
        // If you have a pin, add it
        // paymentData.pin = 'YOUR_PIN_HERE';

        // Remove empty fields
        Object.keys(paymentData).forEach(key => {
            if (paymentData[key] === '' || paymentData[key] === null || paymentData[key] === undefined) {
                delete paymentData[key];
            }
        });

        // Signed fields for payment
        const paymentSignedFields = ['vendor', 'transid', 'amount', 'msisdn'];
        
        // Add pin if present
        if (paymentData.pin) {
            paymentSignedFields.push('pin');
        }

        // Generate digest for payment
        const paymentDigest = this.generateDigest(
            apiSecret,
            timestamp,
            paymentData,
            paymentSignedFields,
        );

        const paymentHeaders = {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `SELCOM ${apiKey}`,
            'Digest-Method': 'HS256',
            'Digest': paymentDigest,
            'Timestamp': timestamp,
            'Signed-Fields': paymentSignedFields.join(','),
        };

        this.logger.debug(`STEP 2: Initiating payment...`);
        this.logger.debug(`Payment Data: ${JSON.stringify(paymentData)}`);
        this.logger.debug(`Payment URL: ${paymentUrl}`);

        const paymentResponse =
            await firstValueFrom(
                this.httpService.post(
                    paymentUrl,
                    paymentData,
                    {
                        headers: paymentHeaders,
                        timeout: 30000,
                    },
                ),
            );

        const paymentResult = paymentResponse.data;

        this.logger.log(
            `STEP 2 Response: ${JSON.stringify(paymentResult)}`,
        );

        // Check if payment was successful
        if (paymentResult?.resultcode === '000' && paymentResult?.result === 'SUCCESS') {
            const transactionId = paymentResult?.transid || paymentResult?.reference || orderReference;

            return {
                success: true,
                transactionId: transactionId,
                raw: {
                    order: createResult,
                    payment: paymentResult,
                },
                data: {
                    order: createResult,
                    payment: paymentResult,
                },
                message: paymentResult?.message || 'Payment initiated successfully',
            };
        }

        // Payment failed but order was created
        return {
            success: false,
            message: paymentResult?.message || 'Payment initiation failed',
            raw: {
                order: createResult,
                payment: paymentResult,
            },
            data: {
                order: createResult,
                payment: paymentResult,
            },
        };

    } catch (error) {
        this.logger.error(
            'SELCOM initiation failed',
            JSON.stringify({
                message: error?.message,
                response: error?.response?.data,
                status: error?.response?.status,
                stack: error?.stack,
            }, null, 2),
        );

        return {
            success: false,
            message: error?.response?.data?.message ||
                error?.response?.data?.error ||
                error?.message ||
                'SELCOM payment failed',
            raw: error?.response?.data,
        };
    }
}


    // ============================================================
    // VERIFY PAYMENT
    // ============================================================

    async verify(
        data: VerifyPaymentInput,
    ): Promise<PaymentProviderResponse> {

        const url =
            this.configService.get<string>(
                'SELCOM_STATUS_URL',
            );

        const {
            vendor,
            apiKey,
            apiSecret,
        } = this.getConfig();

        if (!url) {
            throw new InternalServerErrorException(
                'SELCOM_STATUS_URL is missing',
            );
        }

        try {
            this.logger.log(
                `Verifying Selcom payment: ${data.reference}`,
            );

            const timestamp =
                this.getTimestamp();

            const requestData: Record<string, any> = {
                vendor: vendor,
                order_id: data.reference,
                timestamp: timestamp,
            };

            const signedFields = ['vendor', 'order_id'];

            const digest = this.generateDigest(
                apiSecret,
                timestamp,
                requestData,
                signedFields,
            );

            const headers = {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `SELCOM ${apiKey}`,
                'Digest-Method': 'HS256',
                'Digest': digest,
                'Timestamp': timestamp,
                'Signed-Fields': signedFields.join(','),
            };

            const response =
                await firstValueFrom(
                    this.httpService.post(
                        url,
                        requestData,
                        {
                            headers,
                            timeout: 30000,
                        },
                    ),
                );

            const result = response.data;

            const success = this.isPaymentSuccessful(result);

            this.logger.log(
                `Selcom payment verification: ${data.reference}, success: ${success}`,
            );

            return {
                success,
                transactionId: result?.transid ||
                    result?.transaction_id ||
                    result?.order_id ||
                    data.reference,
                message: result?.message ||
                    (success ? 'Payment successful' : 'Payment not successful'),
                raw: result,
                data: result,
            };

        } catch (error) {
            this.logger.error(
                'Selcom verification failed',
                JSON.stringify({
                    message: error?.message,
                    response: error?.response?.data,
                    status: error?.response?.status,
                }, null, 2),
            );

            return {
                success: false,
                message: error?.response?.data?.message ||
                    error?.response?.data?.error ||
                    error?.message ||
                    'Selcom verification failed',
                raw: error?.response?.data,
            };
        }
    }


    // ============================================================
    // CANCEL ORDER
    // ============================================================

    async cancelOrder(
        reference: string,
    ): Promise<PaymentProviderResponse> {

        const url =
            this.configService.get<string>(
                'SELCOM_CANCEL_ORDER_URL',
            );

        const {
            vendor,
            apiKey,
            apiSecret,
        } = this.getConfig();

        if (!url) {
            throw new InternalServerErrorException(
                'SELCOM_CANCEL_ORDER_URL is missing',
            );
        }

        try {
            this.logger.log(
                `Canceling Selcom order: ${reference}`,
            );

            const timestamp =
                this.getTimestamp();

            const requestData: Record<string, any> = {
                vendor: vendor,
                order_id: reference,
                timestamp: timestamp,
            };

            const signedFields = ['vendor', 'order_id'];

            const digest = this.generateDigest(
                apiSecret,
                timestamp,
                requestData,
                signedFields,
            );

            const headers = {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `SELCOM ${apiKey}`,
                'Digest-Method': 'HS256',
                'Digest': digest,
                'Timestamp': timestamp,
                'Signed-Fields': signedFields.join(','),
            };

            const response =
                await firstValueFrom(
                    this.httpService.post(
                        url,
                        requestData,
                        {
                            headers,
                            timeout: 30000,
                        },
                    ),
                );

            const result = response.data;

            this.logger.log(
                `Selcom order cancellation: ${reference}, result: ${JSON.stringify(result)}`,
            );

            return {
                success: this.isSuccessfulResponse(result),
                transactionId: result?.transid ||
                    result?.transaction_id ||
                    reference,
                message: result?.message ||
                    'Selcom order cancellation request completed',
                raw: result,
                data: result,
            };

        } catch (error) {
            this.logger.error(
                'Selcom cancellation failed',
                JSON.stringify({
                    message: error?.message,
                    response: error?.response?.data,
                    status: error?.response?.status,
                }, null, 2),
            );

            return {
                success: false,
                message: error?.response?.data?.message ||
                    error?.message ||
                    'Selcom cancellation failed',
                raw: error?.response?.data,
            };
        }
    }


    // ============================================================
    // RESPONSE SUCCESS
    // ============================================================

    private isSuccessfulResponse(
        result: any,
    ): boolean {

        if (result?.resultcode === '000') {
            return true;
        }

        const value =
            String(
                result?.result ??
                result?.status ??
                '',
            ).toUpperCase();

        return [
            'SUCCESS',
            'SUCCESSFUL',
            'COMPLETED',
            'OK',
        ].includes(value);
    }


    // ============================================================
    // PAYMENT SUCCESS
    // ============================================================

    private isPaymentSuccessful(
        result: any,
    ): boolean {

        if (result?.resultcode === '000') {
            return true;
        }

        const value =
            String(
                result?.result ??
                result?.status ??
                result?.payment_status ??
                '',
            ).toUpperCase();

        return [
            'SUCCESS',
            'SUCCESSFUL',
            'COMPLETED',
            'PAID',
        ].includes(value);
    }


    // ============================================================
    // LIST PAYMENTS (Not Supported)
    // ============================================================

    async listPayments(
        data: ListPaymentsInput,
    ): Promise<ListPaymentsResponse> {

        this.logger.warn(
            'List payments is not supported by Selcom provider',
        );

        return {
            success: false,
            data: {
                payments: [],
                total: 0,
                limit: data.limit || 20,
                offset: data.offset || 0,
            },
            message: 'List payments is not supported by Selcom provider',
        };
    }


    // ============================================================
    // GET BALANCE (Not Supported)
    // ============================================================

    async getBalance(): Promise<BalanceResponse> {

        this.logger.warn(
            'Get balance is not supported by Selcom provider',
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
            message: 'Get balance is not supported by Selcom provider',
        };
    }


    // ============================================================
    // SEARCH PAYMENTS (Not Supported)
    // ============================================================

    async searchPayments(
        data: SearchPaymentsInput,
    ): Promise<SearchPaymentsResponse> {

        this.logger.warn(
            'Search payments is not supported by Selcom provider',
        );

        return {
            success: false,
            data: {
                payments: [],
            },
            message: 'Search payments is not supported by Selcom provider',
        };
    }


    // ============================================================
    // TRIGGER USSD PUSH (Not Supported)
    // ============================================================

    async triggerUssdPush(
        data: TriggerUssdPushInput,
    ): Promise<TriggerUssdPushResponse> {

        this.logger.warn(
            'USSD push is not supported by Selcom provider',
        );

        return {
            success: false,
            data: {
                status: 'failed',
                message: 'USSD push is not supported by Selcom provider',
                reference: data.reference,
            },
            message: 'USSD push is not supported by Selcom provider',
        };
    }
}