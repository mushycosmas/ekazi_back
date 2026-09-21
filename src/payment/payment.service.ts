import {
    Injectable,
    NotFoundException,
    BadRequestException,
    ConflictException,
    InternalServerErrorException,
    Logger,
} from '@nestjs/common';

import {
    InjectRepository,
} from '@nestjs/typeorm';

import {
    DataSource,
    Repository,
} from 'typeorm';

import {
    randomUUID,
} from 'crypto';

import { Users } from 'src/entities/users.entity';
import { AuthService } from 'src/auth/auth.service';

import { Applicants } from 'src/entities/applicants/applicants.entity';
import { Clients } from 'src/client/clients.entity';

import { Subscription } from './entities/subscription.entity';
import { SubscriptionPlan } from './entities/subscription-plan.entity';
import { SubscriptionPaymentsQueryDto } from './dto/subscription-payments-query.dto';
import { NotificationsService } from 'src/notifications/notifications.service';


import {
    SubscriptionPayment,
    PaymentStatus,
    PaymentRole,
} from './entities/subscription-payment.entity';

import {
    InitiatePaymentDto,
} from './dto/initiate-payment.dto';

import {
    PaymentProviderFactory,
} from './providers/payment-provider.factory';


@Injectable()
export class PaymentService {

    private readonly logger =
        new Logger(
            PaymentService.name,
        );


    constructor(

        @InjectRepository(Subscription)
        private readonly subscriptionRepository:
            Repository<Subscription>,

        @InjectRepository(SubscriptionPlan)
        private readonly subscriptionPlanRepository:
            Repository<SubscriptionPlan>,

        @InjectRepository(SubscriptionPayment)
        private readonly subscriptionPaymentRepository:
            Repository<SubscriptionPayment>,

        @InjectRepository(Applicants)
        private readonly applicantRepository:
            Repository<Applicants>,

        @InjectRepository(Clients)
        private readonly clientRepository:
            Repository<Clients>,

        private readonly paymentProviderFactory:
            PaymentProviderFactory,

        private readonly dataSource:
            DataSource,

        private readonly authService:
            AuthService,
        private readonly notifications: NotificationsService,

    ) { }


    // ============================================================
    // RESOLVE CUSTOMER
    // ============================================================

    private async resolveCustomer(
        user: Users,
        role: PaymentRole,
        phone: string,
    ) {
        const email = user.email?.trim();

        if (!email) {
            throw new BadRequestException(
                'User email is required for payment',
            );
        }

        // --------------------------------------------------------
        // APPLICANT
        // --------------------------------------------------------
        if (role === PaymentRole.APPLICANT) {

            const applicant =
                await this.applicantRepository.findOne({
                    where: { user_id: user.id },
                });

            if (!applicant) {
                throw new NotFoundException(
                    'Applicant profile not found',
                );
            }

            const firstname =
                applicant.first_name?.trim() || 'Applicant';

            const middlename =
                applicant.middle_name?.trim() || '';

            const lastname =
                applicant.last_name?.trim() || 'Customer';

            return {
                firstname,
                middlename,
                lastname,
                email,
                phone,
                name: [firstname, middlename, lastname]
                    .filter(Boolean)
                    .join(' '),
            };
        }

        // --------------------------------------------------------
        // EMPLOYER
        // --------------------------------------------------------
        if (role === PaymentRole.EMPLOYER) {

            this.logger.log(
                `[Payment] Resolving employer. user_id=${user.id}, client_id=${(user as any).client_id}`,
            );

            let client: Clients | null = null;

            const clientId = (user as any).client_id;

            if (clientId) {
                client = await this.clientRepository.findOne({
                    where: { id: Number(clientId) },
                });
            }

            if (!client) {
                client = await this.clientRepository.findOne({
                    where: { user_id: user.id },
                });
            }

            if (!client) {
                this.logger.error(
                    `[Payment] Employer client not found. user_id=${user.id}, client_id=${clientId || 'NULL'}`,
                );

                throw new NotFoundException(
                    `Employer/client profile not found for user ${user.id}`,
                );
            }

            const firstname = client.first_name?.trim();
            const lastname = client.last_name?.trim();

            if (!firstname) {
                throw new BadRequestException(
                    'Client first name is required for payment',
                );
            }

            if (!lastname) {
                throw new BadRequestException(
                    'Client last name is required for payment',
                );
            }

            return {
                firstname,
                middlename: '',
                lastname,
                email,
                phone,
                name: `${firstname} ${lastname}`,
                client_id: client.id,
            };
        }

        throw new BadRequestException(
            'Unsupported payment role',
        );
    }


    // ============================================================
    // CALCULATE PAYMENT AMOUNT
    // ============================================================

    private async calculatePaymentAmount(
        plan: SubscriptionPlan,
        userId: number,
    ): Promise<number> {

        let amount = Number(plan.price);

        if (!amount || amount <= 0) {
            throw new BadRequestException(
                'Subscription plan amount must be greater than zero',
            );
        }

        const currentSubscription =
            await this.subscriptionRepository.findOne({
                where: {
                    user_id: userId,
                    is_active: true,
                },
                relations: ['plan'],
                order: { end_date: 'DESC' },
            });

        if (
            currentSubscription &&
            currentSubscription.plan &&
            currentSubscription.plan.id !== plan.id
        ) {
            const now = new Date();
            const endDate = new Date(currentSubscription.end_date);

            let remainingDays = Math.ceil(
                (endDate.getTime() - now.getTime()) /
                (1000 * 60 * 60 * 24),
            );

            if (remainingDays < 0) remainingDays = 0;

            const oldPlan =
                await this.subscriptionPlanRepository.findOne({
                    where: { id: currentSubscription.plan.id },
                });

            if (oldPlan && Number(oldPlan.duration_days) > 0) {
                const credit =
                    (Number(oldPlan.price) /
                        Number(oldPlan.duration_days)) *
                    remainingDays;

                amount = Math.max(
                    0,
                    Number(plan.price) - credit,
                );

                amount =
                    Math.round(amount * 100) / 100;
            }
        }

        if (amount <= 0) {
            this.logger.warn(
                `Calculated payment amount is ${amount} for user ${userId}.`,
            );
        }

        return amount;
    }


    // ============================================================
    // CHECK PENDING PAYMENT
    // ============================================================

    private async checkPendingPayment(
        userId: number,
        planId: number,
    ) {
        const existingPayment =
            await this.subscriptionPaymentRepository.findOne({
                where: {
                    user_id: userId,
                    subscription_plan_id: planId,
                    status: PaymentStatus.PENDING,
                },
                order: { created_at: 'DESC' },
            });

        if (!existingPayment) return null;

        const age =
            Date.now() -
            new Date(existingPayment.created_at).getTime();

        // Ignore stale pending payments older than 5 minutes.
        if (age >= 5 * 60 * 1000) return null;

        return existingPayment;
    }


    // ============================================================
    // CREATE PAYMENT
    // ============================================================

    private async createPayment(
        plan: SubscriptionPlan,
        role: PaymentRole,
        customer: {
            firstname: string;
            middlename?: string;
            lastname: string;
            email: string;
            phone: string;
            name: string;
            client_id?: number;
        },
        userId: number,
        providerName?: string,
        registrationPayment: boolean = false,
    ) {

        // ========================================================
        // AMOUNT
        // ========================================================

        let amount = Number(plan.price);

        if (!amount || amount <= 0) {
            throw new BadRequestException(
                'Subscription plan amount must be greater than zero',
            );
        }

        // ========================================================
        // REFERENCE
        // ========================================================

        const reference =
            `SUB_${Date.now()}_${randomUUID()
                .replace(/-/g, '')
                .substring(0, 8)
                .toUpperCase()}`;

        // ========================================================
        // PROVIDER
        // ========================================================

        const provider = providerName || 'selcom';

        // ========================================================
        // CREATE PAYMENT RECORD
        // ========================================================

        const payment =
            this.subscriptionPaymentRepository.create({
                user_id: userId,
                subscription_plan_id: plan.id,
                amount,
                transaction_id: reference,
                provider,
                role,
                status: PaymentStatus.PENDING,
                meta: {
                    registration_payment: registrationPayment,
                    verification_email_sent_at: null,
                    customer: {
                        firstname: customer.firstname,
                        middlename: customer.middlename || '',
                        lastname: customer.lastname,
                        email: customer.email,
                        phone: customer.phone,
                        name: customer.name,
                        client_id: customer.client_id || null,
                    },
                },
            });

        await this.subscriptionPaymentRepository.save(payment);

        // ========================================================
        // CALLBACK
        // ========================================================

        const callbackUrl =
            process.env.PAYMENT_CALLBACK_URL ||
            'https://backend.ekazi.co.tz/api/payment/callback/selcom';

        // ========================================================
        // PROVIDER INSTANCE
        // ========================================================

        const paymentProvider =
            this.paymentProviderFactory.getProvider(provider);

        this.logger.log(`[Payment] Provider: ${provider}`);
        this.logger.log(`[Payment] Reference: ${reference}`);
        this.logger.log(`[Payment] User ID: ${userId ?? 'GUEST'}`);
        this.logger.log(`[Payment] Amount: ${amount}`);
        this.logger.log(
            `[Payment] Registration payment: ${registrationPayment}`,
        );

        // ========================================================
        // INITIATE
        // ========================================================

        try {

            let providerResponse: any;



            // ------------------------------------------------
            // NORMAL FLOW (unchanged)
            // ------------------------------------------------
            providerResponse =
                await paymentProvider.initiate({
                    reference,
                    amount,
                    phone: customer.phone,
                    currency: 'TZS',
                    callbackUrl,
                    customer,
                });


            // ====================================================
            // PROVIDER FAILED
            // ====================================================

            if (!providerResponse.success) {

                await this.subscriptionPaymentRepository.update(
                    { id: payment.id },
                    {
                        status: PaymentStatus.FAILED,
                        failure_reason:
                            providerResponse.message ||
                            'Payment initiation failed',
                    },
                );

                throw new BadRequestException({
                    success: false,
                    message:
                        providerResponse.message ||
                        'Payment initiation failed',
                    data: providerResponse.raw,
                });
            }

            // ====================================================
            // TRANSACTION REFERENCE
            // ====================================================

            if (!providerResponse.transactionId) {

                await this.subscriptionPaymentRepository.update(
                    { id: payment.id },
                    {
                        status: PaymentStatus.FAILED,
                        failure_reason:
                            'Payment provider did not return a transaction reference',
                    },
                );

                throw new BadRequestException(
                    'Payment provider did not return a transaction reference',
                );
            }

            // ====================================================
            // SAVE PROVIDER TRANSACTION
            // ====================================================

            payment.provider_transaction_id =
                providerResponse.transactionId;

            payment.payment_type =
                providerResponse.raw?.payment_type ||
                providerResponse.raw?.data?.payment_type ||
                providerResponse.raw?.payment_method ||
                providerResponse.raw?.data?.payment_method ||
                null;

            await this.subscriptionPaymentRepository.save(payment);

            // ====================================================
            // RESPONSE
            // ====================================================

            return {
                success: true,
                message: 'Payment initiated successfully',
                data: {
                    reference,
                    amount,
                    currency: 'TZS',
                    provider,
                    customer: {
                        firstname: customer.firstname,
                        lastname: customer.lastname,
                        email: customer.email,
                        phone: customer.phone,
                    },

                    // Registration flow: frontend uses these
                    payment_token:
                        providerResponse?.data?.payment_token,

                    payment_gateway_url:
                        providerResponse?.data?.payment_gateway_url,

                    qr:
                        providerResponse?.data?.qr,

                    requires_wallet_push:
                        providerResponse?.data
                            ?.requires_wallet_push ?? false,

                    payment: providerResponse.raw,
                },
            };

        } catch (error) {

            if (error instanceof BadRequestException) {
                throw error;
            }

            this.logger.error(
                `[Payment] Provider initiation failed: ${error?.message || error
                }`,
                error?.stack,
            );

            await this.subscriptionPaymentRepository.update(
                { id: payment.id },
                {
                    status: PaymentStatus.FAILED,
                    failure_reason:
                        error?.message ||
                        'Payment provider error',
                },
            );

            throw new InternalServerErrorException(
                'Unable to initiate payment',
            );
        }
    }


    // ============================================================
    // INITIATE PAYMENT INTERNAL
    // ============================================================

    private async initiatePaymentInternal(
        dto: InitiatePaymentDto,
        user: Users,
        registrationPayment: boolean = false,
    ) {

        if (!user?.id) {
            throw new BadRequestException(
                'Authenticated user is required',
            );
        }

        const plan =
            await this.subscriptionPlanRepository.findOne({
                where: { id: dto.plan_id },
            });

        if (!plan) {
            throw new NotFoundException(
                'Subscription plan not found',
            );
        }

        const role =
            plan.role === 'applicant'
                ? PaymentRole.APPLICANT
                : PaymentRole.EMPLOYER;

        if (registrationPayment) {
            if (user.verified === true) {
                throw new BadRequestException(
                    'Account is already verified. Use the normal payment endpoint.',
                );
            }
        }

        const customer =
            await this.resolveCustomer(user, role, dto.phone);

        this.logger.log(
            `[Payment] Customer resolved: ${JSON.stringify({
                userId: user.id,
                role,
                registrationPayment,
                firstname: customer.firstname,
                lastname: customer.lastname,
                middlename: customer.middlename,
                email: customer.email,
                phone: customer.phone,
                name: customer.name,
            })}`,
        );

        const amount =
            await this.calculatePaymentAmount(plan, user.id);

        const pendingPayment =
            await this.checkPendingPayment(user.id, plan.id);

        if (pendingPayment) {
            return {
                success: false,
                message: 'You already have a pending payment',
                data: {
                    reference: pendingPayment.transaction_id,
                    provider_reference:
                        pendingPayment.provider_transaction_id,
                    amount: pendingPayment.amount,
                    status: pendingPayment.status,
                },
            };
        }

        const providerName =
            dto.provider?.trim() || 'selcom';

        return this.createPayment(
            { ...plan, price: amount } as SubscriptionPlan,
            role,
            customer,
            user.id,
            providerName,
            registrationPayment,
        );
    }


    // ============================================================
    // NORMAL AUTHENTICATED PAYMENT
    // ============================================================

    async initiatePayment(
        dto: InitiatePaymentDto,
        user: Users,
    ) {
        return this.initiatePaymentInternal(dto, user, false);
    }


    // ============================================================
    // REGISTRATION PAYMENT
    // ============================================================

    async initiateRegistrationPayment(
        dto: InitiatePaymentDto,
        user: Users,
    ) {
        return this.initiatePaymentInternal(dto, user, true);
    }


    // ============================================================
    // TRIGGER SELCOM WALLET PUSH (USSD)
    // ============================================================
    //
    // Used by the registration flow when the user is ready to
    // enter their PIN. Also usable by the normal flow if you ever
    // want to defer the push.
    // ============================================================

    async triggerSelcomWalletPush(
        reference: string,
        phone?: string,
    ) {

        if (!reference) {
            throw new BadRequestException(
                'Payment reference is required',
            );
        }

        const payment =
            await this.subscriptionPaymentRepository.findOne({
                where: { transaction_id: reference },
            });

        if (!payment) {
            throw new NotFoundException(
                `Payment not found: ${reference}`,
            );
        }

        if (payment.status === PaymentStatus.SUCCESS) {
            throw new BadRequestException(
                'Payment has already been completed',
            );
        }

        if (payment.provider !== 'selcom') {
            throw new BadRequestException(
                'Wallet push is only supported for SELCOM',
            );
        }

        const msisdn =
            phone?.trim() ||
            payment.meta?.customer?.phone;

        if (!msisdn) {
            throw new BadRequestException(
                'Phone number is required for wallet push',
            );
        }

        const selcomProvider =
            this.paymentProviderFactory.getSelcomProvider();

        this.logger.log(
            `[Payment] Triggering SELCOM wallet push for ${reference}, phone=${msisdn}`,
        );

        const result =
            await selcomProvider.walletPayment({
                transid: payment.transaction_id,
                order_id: payment.transaction_id,
                msisdn,
            });

        this.logger.log(
            `[Payment] SELCOM wallet push result: ${JSON.stringify(
                result,
            )}`,
        );

        // Save provider reference if we now have one
        if (
            result?.transactionId &&
            payment.provider_transaction_id !== result.transactionId
        ) {
            payment.provider_transaction_id =
                result.transactionId;

            await this.subscriptionPaymentRepository.save(
                payment,
            );
        }

        if (!result?.success) {
            await this.subscriptionPaymentRepository.update(
                { id: payment.id },
                {
                    failure_reason:
                        result?.message ||
                        'Wallet push failed',
                },
            );

            return {
                success: false,
                message:
                    result?.message || 'Wallet push failed',
                data: {
                    reference,
                    status: 'FAILED',
                    raw: result?.raw,
                },
            };
        }

        return {
            success: true,
            message:
                result?.message ||
                'USSD push sent. Ask the customer to confirm the payment on their phone.',
            data: {
                reference,
                provider_reference:
                    result?.transactionId ||
                    payment.provider_transaction_id,
                status:
                    result?.data?.status || 'PENDING',
                raw: result?.raw,
            },
        };
    }


    // ============================================================
    // SEND REGISTRATION VERIFICATION EMAIL
    // ============================================================

    private async sendRegistrationVerificationEmailIfRequired(
        payment: SubscriptionPayment,
    ) {

        const registrationPayment =
            payment.meta?.registration_payment === true;

        if (!registrationPayment) return;

        if (!payment.user_id) {
            this.logger.warn(
                `Registration payment ${payment.id} has no user_id. Verification email skipped.`,
            );
            return;
        }

        if (payment.meta?.verification_email_sent_at) {
            this.logger.log(
                `Verification email already sent for payment ${payment.id}.`,
            );
            return;
        }

        const user =
            await this.dataSource
                .getRepository(Users)
                .findOne({ where: { id: payment.user_id } });

        if (!user) {
            this.logger.warn(
                `User ${payment.user_id} not found for payment ${payment.id}. Verification email skipped.`,
            );
            return;
        }

        if (user.verified === true) {
            this.logger.log(
                `User ${user.id} is already verified. Verification email skipped.`,
            );
            return;
        }

        const email = user.email?.trim();

        if (!email) {
            this.logger.warn(
                `User ${user.id} has no email. Verification email skipped.`,
            );
            return;
        }

        try {
            await this.authService.sendVerificationEmail(
                email,
                user.username || email,
            );

            payment.meta = {
                ...(payment.meta || {}),
                verification_email_sent_at:
                    new Date().toISOString(),
            };

            await this.subscriptionPaymentRepository.save(payment);

            this.logger.log(
                `Verification email sent after successful registration payment. User=${user.id}, Payment=${payment.id}`,
            );
        } catch (error: any) {
            this.logger.error(
                `Failed to send verification email after successful payment. User=${user.id}, Payment=${payment.id}`,
                error?.stack || error,
            );
        }
    }


    // ============================================================
    // SELCOM OPERATIONS (passthrough)
    // ============================================================

    async selcomCreateOrder(data: any) {
        const provider =
            this.paymentProviderFactory.getSelcomProvider();
        return provider.createOrder(data);
    }

    async selcomWalletPayment(data: any) {
        const provider =
            this.paymentProviderFactory.getSelcomProvider();
        return provider.walletPayment(data);
    }

    async selcomSelcomPesaPayment(data: any) {
        const provider =
            this.paymentProviderFactory.getSelcomProvider();
        return provider.selcompesaPayment(data);
    }

    async selcomOrderStatus(reference: string) {
        const provider =
            this.paymentProviderFactory.getSelcomProvider();
        return provider.orderStatus(reference);
    }

    async selcomCancelOrder(reference: string) {
        const provider =
            this.paymentProviderFactory.getSelcomProvider();
        return provider.cancelOrder(reference);
    }

    async selcomListOrders(
        fromdate: string,
        todate: string,
    ) {
        const provider =
            this.paymentProviderFactory.getSelcomProvider();

        if (!provider.listOrders) {
            return {
                success: false,
                message:
                    'List orders is not supported by this payment provider',
            };
        }

        return provider.listOrders(fromdate, todate);
    }


    // ============================================================
    // SELCOM CALLBACK
    // ============================================================

    async handleSelcomCallback(payload: any) {
        try {

            this.logger.log(
                `SELCOM CALLBACK RECEIVED: ${JSON.stringify(payload)}`,
            );

            const orderId =
                payload?.order_id ||
                payload?.orderId ||
                payload?.transid;

            const selcomReference =
                payload?.reference ||
                payload?.transaction_id;

            this.logger.log(
                `SELCOM order_id: ${orderId || 'N/A'}`,
            );

            this.logger.log(
                `SELCOM reference: ${selcomReference || 'N/A'}`,
            );

            if (!orderId && !selcomReference) {
                throw new BadRequestException(
                    'Payment reference is required',
                );
            }

            // ====================================================
            // FIND PAYMENT
            // ====================================================

            let payment: SubscriptionPayment | null = null;

            if (orderId) {
                payment =
                    await this.subscriptionPaymentRepository.findOne({
                        where: { transaction_id: orderId },
                    });
            }

            if (!payment && selcomReference) {
                payment =
                    await this.subscriptionPaymentRepository.findOne({
                        where: {
                            provider_transaction_id:
                                selcomReference,
                        },
                    });
            }

            if (!payment) {
                this.logger.error(
                    `SELCOM PAYMENT NOT FOUND. orderId=${orderId}, reference=${selcomReference}`,
                );

                throw new NotFoundException(
                    `Payment not found. order_id=${orderId}, reference=${selcomReference}`,
                );
            }

            this.logger.log(
                `SELCOM PAYMENT FOUND: ID=${payment.id}, transaction_id=${payment.transaction_id}, provider_transaction_id=${payment.provider_transaction_id}`,
            );

            // ====================================================
            // ALREADY SUCCESSFUL
            // ====================================================

            if (payment.status === PaymentStatus.SUCCESS) {
                await this.sendRegistrationVerificationEmailIfRequired(
                    payment,
                );

                return {
                    success: true,
                    message: 'Payment already processed',
                };
            }

            // ====================================================
            // SAVE SELCOM REFERENCE IF AVAILABLE
            // ====================================================

            if (
                selcomReference &&
                payment.provider_transaction_id !== selcomReference
            ) {
                payment.provider_transaction_id =
                    selcomReference;

                await this.subscriptionPaymentRepository.save(
                    payment,
                );
            }

            // ====================================================
            // VERIFY WITH SELCOM
            // ====================================================

            const provider =
                this.paymentProviderFactory.getSelcomProvider();

            const verificationReference = payment.transaction_id;

            this.logger.log(
                `SELCOM verification reference: ${verificationReference}`,
            );

            const verification = await provider.verify({
                reference: verificationReference,
            });

            this.logger.log(
                `SELCOM VERIFICATION RESULT: ${JSON.stringify(
                    verification,
                )}`,
            );

            // ====================================================
            // NORMALIZE (this is the key fix)
            // ====================================================

            const raw = verification?.raw || {};

            const dataNode =
                Array.isArray(raw?.data)
                    ? raw.data[0]
                    : raw?.data;

            const rawPaymentStatus = String(
                verification?.data?.payment_status ||
                verification?.data?.status ||
                dataNode?.payment_status ||
                dataNode?.status ||
                raw?.payment_status ||
                raw?.status ||
                '',
            )
                .toUpperCase()
                .trim();

            const rawResult = String(
                raw?.result || '',
            )
                .toUpperCase()
                .trim();

            const rawResultCode = String(
                raw?.resultcode || '',
            ).trim();

            this.logger.log(
                `SELCOM NORMALIZED: payment_status=${rawPaymentStatus}, result=${rawResult}, resultcode=${rawResultCode}`,
            );

            const completedStatuses = [
                'COMPLETED',
                'COMPLETE',
                'SUCCESS',
                'SUCCESSFUL',
                'PAID',
            ];

            const pendingStatuses = [
                'PENDING',
                'INPROGRESS',
                'IN_PROGRESS',
                'PROCESSING',
            ];

            const isCompleted =
                completedStatuses.includes(rawPaymentStatus) ||
                verification.success === true;

            const isPending =
                !isCompleted &&
                (pendingStatuses.includes(rawPaymentStatus) ||
                    rawResult === 'PENDING' ||
                    rawResultCode === '111');

            // ====================================================
            // SUCCESS
            // ====================================================

            if (isCompleted) {

                const providerTransactionId =
                    verification?.transactionId ||
                    raw?.reference ||
                    selcomReference ||
                    payment.provider_transaction_id;

                if (providerTransactionId) {
                    payment.provider_transaction_id =
                        providerTransactionId;
                }

                await this.subscriptionPaymentRepository.save(
                    payment,
                );

                await this.activateSubscription(payment.id);

                await this.sendRegistrationVerificationEmailIfRequired(
                    payment,
                );

                this.logger.log(
                    `SELCOM PAYMENT SUCCESS. Payment ID=${payment.id}`,
                );

                return {
                    success: true,
                    message:
                        'Subscription activated successfully',
                };
            }

            // ====================================================
            // STILL PENDING
            // ====================================================

            if (isPending) {

                await this.subscriptionPaymentRepository.update(
                    { id: payment.id },
                    {
                        status: PaymentStatus.PENDING,
                        failure_reason: null,
                    },
                );

                this.logger.log(
                    `SELCOM PAYMENT STILL PENDING. Payment ID=${payment.id}`,
                );

                return {
                    success: true,
                    message: 'Payment is still pending',
                };
            }

            // ====================================================
            // FAILED
            // ====================================================

            await this.subscriptionPaymentRepository.update(
                { id: payment.id },
                {
                    status: PaymentStatus.FAILED,
                    failure_reason:
                        verification?.message ||
                        raw?.message ||
                        `SELCOM payment failed (status=${rawPaymentStatus || 'UNKNOWN'})`,
                },
            );

            this.logger.warn(
                `SELCOM PAYMENT FAILED. Payment ID=${payment.id}`,
            );

            return {
                success: false,
                message:
                    verification?.message || 'Payment failed',
            };

        } catch (error: any) {

            this.logger.error(
                'SELCOM callback processing failed',
                error?.stack || error,
            );

            throw error;
        }
    }


    // ============================================================
    // SNIPPE WEBHOOK
    // ============================================================

    async handleSnippeWebhook(event: any) {
        try {

            this.logger.log(
                `Snippe webhook received: ${JSON.stringify(event)}`,
            );

            const eventType =
                event?.type || event?.event;

            const snippeReference =
                event?.data?.reference ||
                event?.reference;

            const internalReference =
                event?.data?.metadata?.order_id ||
                event?.metadata?.order_id ||
                event?.data?.order_id ||
                event?.order_id;

            this.logger.log(
                `Snippe reference: ${snippeReference}`,
            );

            this.logger.log(
                `Internal reference: ${internalReference}`,
            );

            if (!internalReference) {
                throw new BadRequestException(
                    'Internal payment reference not found in Snippe webhook',
                );
            }

            const payment =
                await this.subscriptionPaymentRepository.findOne({
                    where: { transaction_id: internalReference },
                });

            if (!payment) {
                throw new NotFoundException(
                    `Payment not found: ${internalReference}`,
                );
            }

            if (payment.status === PaymentStatus.SUCCESS) {
                await this.sendRegistrationVerificationEmailIfRequired(
                    payment,
                );

                return {
                    success: true,
                    message: 'Payment already processed',
                };
            }

            if (
                eventType === 'payment.failed' ||
                eventType === 'payment.expired' ||
                eventType === 'payment.voided'
            ) {
                await this.subscriptionPaymentRepository.update(
                    { id: payment.id },
                    { status: PaymentStatus.FAILED },
                );

                return {
                    success: true,
                    message: 'Payment marked as failed',
                };
            }

            if (eventType !== 'payment.completed') {
                return {
                    success: true,
                    message: 'Webhook event ignored',
                };
            }

            if (!snippeReference) {
                throw new BadRequestException(
                    'Snippe payment reference is missing',
                );
            }

            const webhookStatus = event?.data?.status;

            if (webhookStatus !== 'completed') {
                return {
                    success: false,
                    message: `Payment is not completed. Current status: ${webhookStatus}`,
                };
            }

            const provider =
                this.paymentProviderFactory.getProvider('snippe');

            const verification = await provider.verify({
                reference: snippeReference,
            });

            if (!verification.success) {
                return {
                    success: false,
                    message: 'Payment verification failed',
                };
            }

            await this.activateSubscription(payment.id);

            await this.sendRegistrationVerificationEmailIfRequired(
                payment,
            );

            return {
                success: true,
                message: 'Snippe payment processed successfully',
            };

        } catch (error) {
            this.logger.error(
                'Snippe webhook processing failed',
                error?.stack || error,
            );

            throw error;
        }
    }


    // ============================================================
    // ACTIVATE SUBSCRIPTION
    // ============================================================

    private async activateSubscription(paymentId: number) {

        const queryRunner =
            this.dataSource.createQueryRunner();

        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {

            const payment =
                await queryRunner.manager
                    .createQueryBuilder(
                        SubscriptionPayment,
                        'payment',
                    )
                    .setLock('pessimistic_write')
                    .where('payment.id = :paymentId', {
                        paymentId,
                    })
                    .getOne();

            if (!payment) {
                throw new NotFoundException('Payment not found');
            }

            if (!payment.user_id) {
                throw new BadRequestException(
                    'Payment is not linked to a user account',
                );
            }

            const existingSubscription =
                await queryRunner.manager.findOne(
                    Subscription,
                    {
                        where: {
                            subscription_payment_id: payment.id,
                        },
                    },
                );

            if (existingSubscription) {
                await queryRunner.commitTransaction();
                return existingSubscription;
            }

            const plan =
                await queryRunner.manager.findOne(
                    SubscriptionPlan,
                    {
                        where: {
                            id: payment.subscription_plan_id,
                        },
                    },
                );

            if (!plan) {
                throw new NotFoundException(
                    'Subscription plan not found',
                );
            }

            // Deactivate old subscriptions
            await queryRunner.manager.update(
                Subscription,
                { user_id: payment.user_id, is_active: true },
                { is_active: false },
            );

            const startDate = new Date();
            const endDate = new Date(startDate);

            endDate.setDate(
                endDate.getDate() + Number(plan.duration_days),
            );

            const subscription =
                queryRunner.manager.create(Subscription, {
                    user_id: payment.user_id,
                    subscription_plan_id: plan.id,
                    start_date: startDate,
                    end_date: endDate,
                    job_post_remaining:
                        plan.job_post_limit ?? -1,
                    cv_download_remaining:
                        plan.cv_download_limit ?? -1,
                    cv_builder_remaining:
                        plan.cv_builder_limit ?? -1,
                    is_active: true,
                    subscription_payment_id: payment.id,
                });

            await queryRunner.manager.save(
                Subscription,
                subscription,
            );

            payment.status = PaymentStatus.SUCCESS;
            payment.paid_at = payment.paid_at || new Date();

            await queryRunner.manager.save(
                SubscriptionPayment,
                payment,
            );

            await queryRunner.commitTransaction();
            // ========================================================
            // PUSH: subscription activated
            // ========================================================
            this.notifications.emitToUser(
                payment.user_id!,
                'subscription.activated',
                {
                    status: 'success',
                    payment_id: payment.id,
                    transaction_id: payment.transaction_id,
                    provider: payment.provider,
                    subscription_id: subscription.id,
                    plan_id: subscription.subscription_plan_id,
                    amount: Number(payment.amount),
                    start_date: subscription.start_date,
                    end_date: subscription.end_date,
                    job_post_remaining: subscription.job_post_remaining,
                    cv_download_remaining: subscription.cv_download_remaining,
                    cv_builder_remaining: subscription.cv_builder_remaining,
                    paid_at: payment.paid_at,
                },
            );

            return subscription;

        } catch (error) {

            await queryRunner.rollbackTransaction();

            this.logger.error(
                'Subscription activation failed',
                error?.stack || error,
            );

            if (
                error instanceof BadRequestException ||
                error instanceof NotFoundException ||
                error instanceof ConflictException
            ) {
                throw error;
            }

            throw new InternalServerErrorException(
                'Failed to activate subscription',
            );

        } finally {
            await queryRunner.release();
        }
    }


    // ============================================================
    // LIST SNIPPE PAYMENTS
    // ============================================================

    async listSnippePayments(
        limit: number = 20,
        offset: number = 0,
    ) {
        const provider =
            this.paymentProviderFactory.getProvider('snippe');

        return provider.listPayments({ limit, offset });
    }


    // ============================================================
    // GET SNIPPE BALANCE
    // ============================================================

    async getSnippeBalance() {
        const provider =
            this.paymentProviderFactory.getProvider('snippe');

        const balance = await provider.getBalance();

        return {
            success: true,
            data: balance,
            message: 'Account balance retrieved successfully',
        };
    }


    // ============================================================
    // SEARCH SNIPPE PAYMENTS
    // ============================================================

    async searchSnippePayments(reference: string) {
        const provider =
            this.paymentProviderFactory.getProvider('snippe');

        const results = await provider.searchPayments({
            reference,
        });

        return {
            success: true,
            data: results,
            message: 'Payment search completed',
        };
    }


    // ============================================================
    // TRIGGER SNIPPE USSD PUSH
    // ============================================================

    async triggerUssdPush(reference: string) {
        const provider =
            this.paymentProviderFactory.getProvider('snippe');

        const result = await provider.triggerUssdPush({
            reference,
        });

        return {
            success: true,
            data: result,
            message: 'USSD push triggered successfully',
        };
    }


    // ============================================================
    // GET SUBSCRIPTION PAYMENTS (paged + search)
    // ============================================================

    async getSubscriptionPayments(
        user: Users,
        query: SubscriptionPaymentsQueryDto,
    ) {
        try {

            const page = Number(query.page) || 1;
            const limit = Number(query.limit) || 20;
            const skip = (page - 1) * limit;
            const search = query.search?.trim() || '';

            const queryBuilder =
                this.subscriptionPaymentRepository
                    .createQueryBuilder('payment')
                    .leftJoinAndSelect(
                        'payment.subscriptionPlan',
                        'plan',
                    )
                    .where('payment.user_id = :userId', {
                        userId: user.id,
                    })
                    .andWhere('payment.role = :role', {
                        role: PaymentRole.EMPLOYER,
                    })
                    .andWhere('payment.status = :status', {
                        status: 'success',
                    });

            if (search) {
                queryBuilder.andWhere(
                    `(
                        payment.transaction_id LIKE :search
                        OR payment.provider_transaction_id LIKE :search
                        OR payment.payment_type LIKE :search
                        OR payment.status LIKE :search
                        OR payment.provider LIKE :search
                        OR plan.name LIKE :search
                    )`,
                    { search: `%${search}%` },
                );
            }

            queryBuilder
                .orderBy('payment.created_at', 'DESC')
                .skip(skip)
                .take(limit);

            const [payments, total] =
                await queryBuilder.getManyAndCount();

            return {
                success: true,
                message:
                    'Subscription payments retrieved successfully',
                data: payments.map((payment) => ({
                    id: payment.id,
                    subscription_plan_id:
                        payment.subscription_plan_id,
                    plan: payment.subscriptionPlan,
                    amount: Number(payment.amount),
                    transaction_id: payment.transaction_id,
                    provider_transaction_id:
                        payment.provider_transaction_id,
                    provider: payment.provider,
                    payment_type: payment.payment_type,
                    status: payment.status,
                    paid_at: payment.paid_at,
                    failure_reason: payment.failure_reason,
                    role: payment.role,
                    created_at: payment.created_at,
                    updated_at: payment.updated_at,
                    meta: payment.meta,
                })),
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            };

        } catch (error) {
            this.logger.error(
                'Error fetching subscription payments',
                error,
            );

            throw new InternalServerErrorException(
                'Failed to fetch subscription payments',
            );
        }
    }


    // ============================================================
    // CURRENT SUBSCRIPTION
    // ============================================================

    async currentSubscription(user: Users) {
        try {

            const subscription =
                await this.subscriptionRepository.findOne({
                    where: {
                        user_id: user.id,
                        is_active: true,
                    },
                    relations: ['plan'],
                    order: { end_date: 'DESC' },
                });

            if (!subscription) {
                return {
                    success: false,
                    message: 'No active subscription',
                    data: [],
                };
            }

            if (new Date(subscription.end_date) < new Date()) {
                subscription.is_active = false;
                await this.subscriptionRepository.save(subscription);

                return {
                    success: false,
                    message: 'Subscription has expired',
                    data: [],
                };
            }

            let paymentData: any = null;

            if (subscription.subscription_payment_id) {
                const payment =
                    await this.subscriptionPaymentRepository.findOne({
                        where: {
                            id: subscription.subscription_payment_id,
                        },
                    });

                if (payment) {
                    paymentData = {
                        id: payment.id,
                        amount: Number(payment.amount),
                        transaction_id: payment.transaction_id,
                        provider_transaction_id:
                            payment.provider_transaction_id,
                        provider: payment.provider,
                        status: payment.status,
                        role: payment.role,
                        paid_at: payment.paid_at,
                        failure_reason: payment.failure_reason,
                        meta: payment.meta,
                        created_at: payment.created_at,
                        updated_at: payment.updated_at,
                    };
                }
            }

            const now = new Date();
            const endDate = new Date(subscription.end_date);

            const remainingDays = Math.max(
                0,
                Math.ceil(
                    (endDate.getTime() - now.getTime()) /
                    (1000 * 60 * 60 * 24),
                ),
            );

            return {
                success: true,
                message:
                    'Current subscription retrieved successfully',
                data: [
                    {
                        id: subscription.id,
                        user_id: subscription.user_id,
                        subscription_plan_id:
                            subscription.subscription_plan_id,
                        plan: subscription.plan,
                        start_date: subscription.start_date,
                        end_date: subscription.end_date,
                        remaining_days: remainingDays,
                        job_post_remaining:
                            subscription.job_post_remaining,
                        cv_download_remaining:
                            subscription.cv_download_remaining,
                        cv_builder_remaining:
                            subscription.cv_builder_remaining,
                        is_active: subscription.is_active,
                        subscription_payment_id:
                            subscription.subscription_payment_id,
                        payment: paymentData,
                        created_at: subscription.created_at,
                        updated_at: subscription.updated_at,
                    },
                ],
            };

        } catch (error) {
            this.logger.error(
                'Error fetching current subscription:',
                error,
            );

            throw new InternalServerErrorException(
                'Failed to fetch current subscription',
            );
        }
    }

    async recoverPendingSelcomPayments() {
        const rows = await this.subscriptionPaymentRepository.find({
            where: [
                { provider: 'selcom', status: PaymentStatus.PENDING },
                { provider: 'selcom', status: PaymentStatus.FAILED },
            ],
            order: { created_at: 'ASC' },
        });

        const results: any[] = [];

        for (const p of rows) {
            // No point retrying rows that don't even have a
            // transaction_id — we can't verify them anyway.
            if (!p.transaction_id) {
                results.push({
                    id: p.id,
                    skipped: true,
                    reason: 'no transaction_id',
                });
                continue;
            }

            try {

                const result = await this.handleSelcomCallback({
                    order_id: p.transaction_id,
                });

                results.push({
                    id: p.id,
                    transaction_id: p.transaction_id,
                    provider_transaction_id:
                        p.provider_transaction_id,
                    result,
                });
            } catch (err: any) {
                results.push({
                    id: p.id,
                    transaction_id: p.transaction_id,
                    error: err?.message || String(err),
                });
            }
        }

        return {
            success: true,
            processed: results.length,
            results,
        };
    }
}