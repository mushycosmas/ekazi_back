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
    ) {}

    // ============================================================
    // INITIATE PAYMENT
    // ============================================================
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

        if (!url || !vendor || !apiKey) {
            throw new InternalServerErrorException(
                'Selcom configuration is missing',
            );
        }

        try {
            this.logger.log(
                `Initiating Selcom payment: ${data.reference}`,
            );

            const response =
                await firstValueFrom(
                    this.httpService.post(
                        url,
                        {
                            vendor,
                            order_id: data.reference,
                            buyer_phone: data.phone,
                            amount: data.amount,
                            currency: data.currency || 'TZS',
                            callback_url: data.callbackUrl,
                            customer: {
                                firstname: data.customer?.firstname,
                                lastname: data.customer?.lastname,
                                email: data.customer?.email,
                            },
                        },
                        {
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${apiKey}`,
                            },
                            timeout: 30000,
                        },
                    ),
                );

            this.logger.log(
                `Selcom payment initiated: ${data.reference}`,
            );

            return {
                success: true,
                transactionId: data.reference,
                raw: response.data,
                data: response.data,
                message: 'Selcom payment initiated successfully',
            };

        } catch (error) {
            this.logger.error(
                'Selcom initiation failed',
                error?.response?.data || error?.message,
            );

            return {
                success: false,
                message: error?.response?.data?.message ||
                    error?.message ||
                    'Selcom payment failed',
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

        const vendor =
            this.configService.get<string>(
                'SELCOM_VENDOR',
            );

        const apiKey =
            this.configService.get<string>(
                'SELCOM_API_KEY',
            );

        if (!url || !vendor || !apiKey) {
            throw new InternalServerErrorException(
                'Selcom configuration is missing',
            );
        }

        try {
            this.logger.log(
                `Verifying Selcom payment: ${data.reference}`,
            );

            const response =
                await firstValueFrom(
                    this.httpService.post(
                        url,
                        {
                            order_id: data.reference,
                            vendor,
                        },
                        {
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${apiKey}`,
                            },
                            timeout: 30000,
                        },
                    ),
                );

            const result = response.data;

            const success =
                result?.result === 'SUCCESS' ||
                result?.status === 'SUCCESS' ||
                result?.status === 'success' ||
                result?.status === 'completed';

            this.logger.log(
                `Selcom payment verification: ${data.reference}, success: ${success}`,
            );

            return {
                success,
                transactionId: data.reference,
                message: result?.message || (success ? 'Payment successful' : 'Payment not successful'),
                raw: result,
                data: result,
            };

        } catch (error) {
            this.logger.error(
                'Selcom verification failed',
                error?.response?.data || error?.message,
            );

            return {
                success: false,
                message: error?.response?.data?.message ||
                    error?.message ||
                    'Selcom verification failed',
                raw: error?.response?.data,
            };
        }
    }

    // ============================================================
    // 🆕 LIST PAYMENTS (Not supported by Selcom)
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
    // 🆕 GET BALANCE (Not supported by Selcom)
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
    // 🆕 SEARCH PAYMENTS (Not supported by Selcom)
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
    // 🆕 TRIGGER USSD PUSH (Not supported by Selcom)
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