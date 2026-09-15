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

    ) { }


    // ============================================================
    // RESOLVE CUSTOMER INFORMATION
    // ============================================================
    // ============================================================
    // RESOLVE AUTHENTICATED CUSTOMER
    // ============================================================

    private async resolveCustomer(
        user: Users,
        role: PaymentRole,
        phone: string,
    ) {
        const email =
            user.email?.trim();

        if (!email) {
            throw new BadRequestException(
                'User email is required for payment',
            );
        }

        // ========================================================
        // APPLICANT
        // ========================================================

        if (
            role === PaymentRole.APPLICANT
        ) {

            const applicant =
                await this.applicantRepository.findOne({
                    where: {
                        user_id: user.id,
                    },
                });

            if (!applicant) {
                throw new NotFoundException(
                    'Applicant profile not found',
                );
            }

            const firstname =
                applicant.first_name?.trim() ||
                'Applicant';

            const middlename =
                applicant.middle_name?.trim() ||
                '';

            const lastname =
                applicant.last_name?.trim() ||
                'Customer';

            return {
                firstname,
                middlename,
                lastname,
                email,
                phone,
                name: [
                    firstname,
                    middlename,
                    lastname,
                ]
                    .filter(Boolean)
                    .join(' '),
            };
        }

        // ========================================================
        // EMPLOYER
        // ========================================================
        if (role === PaymentRole.EMPLOYER) {

            this.logger.log(
                `[Payment] Resolving employer. user_id=${user.id}, client_id=${(user as any).client_id}`,
            );

            let client: Clients | null = null;

            // ========================================================
            // FIRST: If Users has client_id, use it
            // ========================================================

            const clientId = (user as any).client_id;

            if (clientId) {
                client = await this.clientRepository.findOne({
                    where: {
                        id: Number(clientId),
                    },
                });
            }

            // ========================================================
            // SECOND: Try Clients.user_id
            // ========================================================

            if (!client) {
                client = await this.clientRepository.findOne({
                    where: {
                        user_id: user.id,
                    },
                });
            }

            // ========================================================
            // CLIENT NOT FOUND
            // ========================================================

            if (!client) {
                this.logger.error(
                    `[Payment] Employer client not found. ` +
                    `user_id=${user.id}, ` +
                    `client_id=${clientId || 'NULL'}`,
                );

                throw new NotFoundException(
                    `Employer/client profile not found for user ${user.id}`,
                );
            }

            this.logger.log(
                `[Payment] Employer client found. ` +
                `client_id=${client.id}, ` +
                `user_id=${user.id}`,
            );

            // ========================================================
            // NAME
            // ========================================================

            const firstname =
                client.first_name?.trim();

            const lastname =
                client.last_name?.trim();

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
        // if (
        //     role === PaymentRole.EMPLOYER
        // ) {

        //     const client =
        //         await this.clientRepository.findOne({
        //             where: {
        //                 user_id: user.id,
        //             },
        //         });

        //     if (!client) {
        //         throw new NotFoundException(
        //             'Employer/client profile not found',
        //         );
        //     }

        //     const firstname =
        //         client.first_name?.trim();

        //     const lastname =
        //         client.last_name?.trim();

        //     if (!firstname) {
        //         throw new BadRequestException(
        //             'Client first name is required for payment',
        //         );
        //     }

        //     if (!lastname) {
        //         throw new BadRequestException(
        //             'Client last name is required for payment',
        //         );
        //     }

        //     return {
        //         firstname,
        //         middlename: '',
        //         lastname,
        //         email,
        //         phone,
        //         name: [
        //             firstname,
        //             lastname,
        //         ]
        //             .filter(Boolean)
        //             .join(' '),
        //         client_id: client.id,
        //     };
        // }

        throw new BadRequestException(
            'Unsupported payment role',
        );
    }

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

        // ============================================================
        // AMOUNT
        // ============================================================

        let amount = Number(plan.price);

        if (!amount || amount <= 0) {
            throw new BadRequestException(
                'Subscription plan amount must be greater than zero',
            );
        }


        // ============================================================
        // REFERENCE
        // ============================================================

        const reference =
            `SUB_${Date.now()}_${randomUUID()
                .replace(/-/g, '')
                .substring(0, 8)
                .toUpperCase()}`;


        // ============================================================
        // PROVIDER
        // ============================================================

        const provider =
            providerName || 'selcom';


        // ============================================================
        // CREATE PAYMENT RECORD
        // ============================================================

        const payment =
            this.subscriptionPaymentRepository.create({
                user_id: userId,

                subscription_plan_id:
                    plan.id,

                amount,

                transaction_id:
                    reference,

                provider,

                role,

                status:
                    PaymentStatus.PENDING,

                meta: {
                    registration_payment:
                        registrationPayment,

                    verification_email_sent_at:
                        null,

                    customer: {
                        firstname:
                            customer.firstname,

                        middlename:
                            customer.middlename || '',

                        lastname:
                            customer.lastname,

                        email:
                            customer.email,

                        phone:
                            customer.phone,

                        name:
                            customer.name,

                        client_id:
                            customer.client_id || null,
                    },
                },
            });

        await this.subscriptionPaymentRepository.save(
            payment,
        );


        // ============================================================
        // CALLBACK
        // ============================================================

        const callbackUrl =
            process.env.PAYMENT_CALLBACK_URL ||
            'https://backend.ekazi.co.tz/api/payment/callback/selcom';


        // ============================================================
        // PAYMENT PROVIDER
        // ============================================================

        const paymentProvider =
            this.paymentProviderFactory.getProvider(
                provider,
            );


        this.logger.log(
            `[Payment] Provider: ${provider}`,
        );

        this.logger.log(
            `[Payment] Reference: ${reference}`,
        );

        this.logger.log(
            `[Payment] User ID: ${userId ?? 'GUEST'}`,
        );

        this.logger.log(
            `[Payment] Amount: ${amount}`,
        );


        // ============================================================
        // INITIATE
        // ============================================================

        try {

            const providerResponse =
                await paymentProvider.initiate({
                    reference,

                    amount,

                    phone:
                        customer.phone,

                    currency:
                        'TZS',

                    callbackUrl,

                    customer,
                });


            // ========================================================
            // PROVIDER FAILED
            // ========================================================

            if (!providerResponse.success) {

                await this.subscriptionPaymentRepository.update(
                    {
                        id: payment.id,
                    },
                    {
                        status:
                            PaymentStatus.FAILED,

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

                    data:
                        providerResponse.raw,
                });
            }


            // ========================================================
            // TRANSACTION REFERENCE
            // ========================================================

            if (!providerResponse.transactionId) {

                await this.subscriptionPaymentRepository.update(
                    {
                        id: payment.id,
                    },
                    {
                        status:
                            PaymentStatus.FAILED,

                        failure_reason:
                            'Payment provider did not return a transaction reference',
                    },
                );

                throw new BadRequestException(
                    'Payment provider did not return a transaction reference',
                );
            }


            // ========================================================
            // SAVE PROVIDER TRANSACTION
            // ========================================================

            payment.provider_transaction_id =
                providerResponse.transactionId;


            payment.payment_type =
                providerResponse.raw?.payment_type ||
                providerResponse.raw?.data?.payment_type ||
                providerResponse.raw?.payment_method ||
                providerResponse.raw?.data?.payment_method ||
                null;


            await this.subscriptionPaymentRepository.save(
                payment,
            );


            // ========================================================
            // RESPONSE
            // ========================================================

            return {
                success: true,

                message:
                    'Payment initiated successfully',

                data: {
                    reference,

                    amount,

                    currency: 'TZS',

                    provider,

                    customer: {
                        firstname:
                            customer.firstname,

                        lastname:
                            customer.lastname,

                        email:
                            customer.email,

                        phone:
                            customer.phone,
                    },

                    payment:
                        providerResponse.raw,
                },
            };

        } catch (error) {

            if (
                error instanceof BadRequestException
            ) {
                throw error;
            }

            this.logger.error(
                `[Payment] Provider initiation failed: ${error?.message || error
                }`,
                error?.stack,
            );

            await this.subscriptionPaymentRepository.update(
                {
                    id: payment.id,
                },
                {
                    status:
                        PaymentStatus.FAILED,

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
                order: {
                    end_date: 'DESC',
                },
            });

        if (
            currentSubscription &&
            currentSubscription.plan &&
            currentSubscription.plan.id !== plan.id
        ) {
            const now = new Date();

            const endDate =
                new Date(currentSubscription.end_date);

            let remainingDays =
                Math.ceil(
                    (
                        endDate.getTime() -
                        now.getTime()
                    ) /
                    (
                        1000 *
                        60 *
                        60 *
                        24
                    ),
                );

            if (remainingDays < 0) {
                remainingDays = 0;
            }

            const oldPlan =
                await this.subscriptionPlanRepository.findOne({
                    where: {
                        id:
                            currentSubscription.plan.id,
                    },
                });

            if (
                oldPlan &&
                Number(oldPlan.duration_days) > 0
            ) {
                const credit =
                    (
                        Number(oldPlan.price) /
                        Number(oldPlan.duration_days)
                    ) *
                    remainingDays;

                amount =
                    Math.max(
                        0,
                        Number(plan.price) -
                        credit,
                    );

                amount =
                    Math.round(
                        amount * 100,
                    ) / 100;
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
                order: {
                    created_at: 'DESC',
                },
            });

        if (!existingPayment) {
            return null;
        }

        const age =
            Date.now() -
            new Date(
                existingPayment.created_at,
            ).getTime();

        // Ignore stale pending payments older than 5 minutes.
        if (
            age >=
            5 * 60 * 1000
        ) {
            return null;
        }

        return existingPayment;
    }

    // ============================================================
    // COMMON PAYMENT INITIATION
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

        // ========================================================
        // FIND PLAN
        // ========================================================

        const plan =
            await this.subscriptionPlanRepository.findOne({
                where: {
                    id: dto.plan_id,
                },
            });

        if (!plan) {
            throw new NotFoundException(
                'Subscription plan not found',
            );
        }

        // ========================================================
        // DETERMINE ROLE
        // ========================================================

        const role =
            plan.role === 'applicant'
                ? PaymentRole.APPLICANT
                : PaymentRole.EMPLOYER;

        // ========================================================
        // REGISTRATION PAYMENT CHECK
        // ========================================================

        if (registrationPayment) {
            if (user.verified === true) {
                throw new BadRequestException(
                    'Account is already verified. Use the normal payment endpoint.',
                );
            }
        }

        // ========================================================
        // CUSTOMER
        // ========================================================

        const customer =
            await this.resolveCustomer(
                user,
                role,
                dto.phone,
            );

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

        // ========================================================
        // PAYMENT AMOUNT
        // ========================================================

        const amount =
            await this.calculatePaymentAmount(
                plan,
                user.id,
            );

        // ========================================================
        // PREVENT DUPLICATE PENDING PAYMENT
        // ========================================================

        const pendingPayment =
            await this.checkPendingPayment(
                user.id,
                plan.id,
            );

        if (pendingPayment) {
            return {
                success: false,
                message:
                    'You already have a pending payment',
                data: {
                    reference:
                        pendingPayment.transaction_id,

                    provider_reference:
                        pendingPayment.provider_transaction_id,

                    amount:
                        pendingPayment.amount,

                    status:
                        pendingPayment.status,
                },
            };
        }

        // ========================================================
        // PROVIDER
        // ========================================================

        const providerName =
            dto.provider?.trim() ||
            'selcom';

        // ========================================================
        // CREATE PAYMENT
        // ========================================================

        return this.createPayment(
            {
                ...plan,
                price: amount,
            } as SubscriptionPlan,

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
    //
    // Existing verified users use this endpoint.
    // Verification email is NOT sent from this flow.

    async initiatePayment(
        dto: InitiatePaymentDto,
        user: Users,
    ) {
        return this.initiatePaymentInternal(
            dto,
            user,
            false,
        );
    }

    // ============================================================
    // REGISTRATION PAYMENT
    // ============================================================
    //
    // Flow:
    // Register user -> create user/client -> authenticate user
    // -> select subscription -> pay -> callback verifies payment
    // -> subscription is created -> verification email is sent.
    //
    // This endpoint is intended for newly registered,
    // authenticated but unverified users.

    async initiateRegistrationPayment(
        dto: InitiatePaymentDto,
        user: Users,
    ) {
        return this.initiatePaymentInternal(
            dto,
            user,
            true,
        );
    }

    // ============================================================
    // SEND REGISTRATION VERIFICATION EMAIL
    // ============================================================
    //
    // IMPORTANT:
    // This is called ONLY after successful payment verification
    // AND successful subscription activation.
    //
    // Normal authenticated payments have:
    // registration_payment = false
    // and therefore never send this email.

    private async sendRegistrationVerificationEmailIfRequired(
        payment: SubscriptionPayment,
    ) {
        const registrationPayment =
            payment.meta?.registration_payment === true;

        if (!registrationPayment) {
            return;
        }

        if (!payment.user_id) {
            this.logger.warn(
                `Registration payment ${payment.id} has no user_id. Verification email skipped.`,
            );
            return;
        }

        if (
            payment.meta?.verification_email_sent_at
        ) {
            this.logger.log(
                `Verification email already sent for payment ${payment.id}.`,
            );
            return;
        }

        const user =
            await this.dataSource
                .getRepository(Users)
                .findOne({
                    where: {
                        id: payment.user_id,
                    },
                });

        if (!user) {
            this.logger.warn(
                `User ${payment.user_id} not found for payment ${payment.id}. Verification email skipped.`,
            );
            return;
        }

        // Do not send verification email if the account
        // has already been verified.
        if (user.verified === true) {
            this.logger.log(
                `User ${user.id} is already verified. Verification email skipped.`,
            );
            return;
        }

        const email =
            user.email?.trim();

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

            await this.subscriptionPaymentRepository.save(
                payment,
            );

            this.logger.log(
                `Verification email sent after successful registration payment. User=${user.id}, Payment=${payment.id}`,
            );
        } catch (error: any) {
            // Do NOT fail the payment/subscription because
            // email delivery failed after successful payment.
            this.logger.error(
                `Failed to send verification email after successful payment. User=${user.id}, Payment=${payment.id}`,
                error?.stack || error,
            );
        }
    }

    // ============================================================
    // SELCOM OPERATIONS
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

        const provider = this.paymentProviderFactory.getSelcomProvider();

        if (!provider.listOrders) {
            return {
                success: false,
                message:
                    'List orders is not supported by this payment provider',
            };
        }

        return provider.listOrders(
            fromdate,
            todate,
        );
    }

    // ============================================================
    // SELCOM CALLBACK
    // ============================================================
    async handleSelcomCallback(payload: any) {
        try {
            // ========================================================
            // LOG CALLBACK
            // ========================================================

            this.logger.log(
                `SELCOM CALLBACK RECEIVED: ${JSON.stringify(payload)}`,
            );

            // ========================================================
            // GET OUR INTERNAL ORDER ID
            // ========================================================

            const orderId =
                payload?.order_id ||
                payload?.orderId ||
                payload?.transid;

            // ========================================================
            // GET SELCOM REFERENCE
            // ========================================================

            const selcomReference =
                payload?.reference ||
                payload?.transaction_id;

            this.logger.log(
                `SELCOM order_id: ${orderId || 'N/A'}`,
            );

            this.logger.log(
                `SELCOM reference: ${selcomReference || 'N/A'}`,
            );

            // ========================================================
            // VALIDATE REFERENCE
            // ========================================================

            if (!orderId && !selcomReference) {
                throw new BadRequestException(
                    'Payment reference is required',
                );
            }

            // ========================================================
            // FIND PAYMENT
            // ========================================================

            let payment: SubscriptionPayment | null = null;

            // 1. Try our internal transaction_id
            if (orderId) {
                payment =
                    await this.subscriptionPaymentRepository.findOne({
                        where: {
                            transaction_id: orderId,
                        },
                    });
            }

            // 2. Try SELCOM provider reference
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
                    `SELCOM PAYMENT NOT FOUND. ` +
                    `orderId=${orderId}, ` +
                    `reference=${selcomReference}`,
                );

                throw new NotFoundException(
                    `Payment not found. ` +
                    `order_id=${orderId}, ` +
                    `reference=${selcomReference}`,
                );
            }

            this.logger.log(
                `SELCOM PAYMENT FOUND: ` +
                `ID=${payment.id}, ` +
                `transaction_id=${payment.transaction_id}, ` +
                `provider_transaction_id=${payment.provider_transaction_id}`,
            );

            // ========================================================
            // ALREADY SUCCESSFUL
            // ========================================================

            if (
                payment.status ===
                PaymentStatus.SUCCESS
            ) {
                // Retry registration verification email if a previous
                // delivery attempt failed after the payment succeeded.
                await this.sendRegistrationVerificationEmailIfRequired(
                    payment,
                );

                return {
                    success: true,
                    message: 'Payment already processed',
                };
            }

            // ========================================================
            // SAVE SELCOM REFERENCE IF AVAILABLE
            // ========================================================

            if (
                selcomReference &&
                payment.provider_transaction_id !==
                selcomReference
            ) {
                payment.provider_transaction_id =
                    selcomReference;

                await this.subscriptionPaymentRepository.save(
                    payment,
                );
            }

            // ========================================================
            // VERIFY WITH SELCOM
            // ========================================================

            const provider =
                this.paymentProviderFactory.getSelcomProvider();

            // IMPORTANT:
            // SELCOM order-status should use OUR order_id
            // e.g. SUB_1788941754240_57D47C99D9

            const verification = await provider.verify({
                reference: payment.transaction_id,
            });

            this.logger.log(
                `SELCOM VERIFICATION RESULT: ${JSON.stringify(
                    verification,
                )}`,
            );

            // ========================================================
            // GET VERIFIED STATUS
            // ========================================================

            const verifiedStatus =
                verification?.data?.status ||
                verification?.raw?.result ||
                verification?.raw?.status ||
                'UNKNOWN';

            this.logger.log(
                `SELCOM VERIFIED STATUS: ${verifiedStatus}`,
            );

            // ========================================================
            // SUCCESS
            // ========================================================

            if (verification.success) {

                const providerTransactionId =
                    verification.transactionId ||
                    verification?.raw?.reference ||
                    selcomReference;

                if (providerTransactionId) {
                    payment.provider_transaction_id =
                        providerTransactionId;
                }

                await this.subscriptionPaymentRepository.save(
                    payment,
                );

                await this.activateSubscription(
                    payment.id,
                );

                await this.sendRegistrationVerificationEmailIfRequired(
                    payment,
                );

                this.logger.log(
                    `SELCOM PAYMENT SUCCESS. ` +
                    `Payment ID=${payment.id}`,
                );

                return {
                    success: true,
                    message:
                        'Subscription activated successfully',
                };
            }

            // ========================================================
            // PAYMENT STILL PENDING
            // ========================================================

            if (
                verifiedStatus === 'PENDING' ||
                verification?.raw?.resultcode === '111' ||
                verification?.raw?.result === 'PENDING'
            ) {

                await this.subscriptionPaymentRepository.update(
                    {
                        id: payment.id,
                    },
                    {
                        status:
                            PaymentStatus.PENDING,
                        failure_reason: null,
                    },
                );

                this.logger.log(
                    `SELCOM PAYMENT STILL PENDING. ` +
                    `Payment ID=${payment.id}`,
                );

                return {
                    success: true,
                    message:
                        'Payment is still pending',
                };
            }

            // ========================================================
            // PAYMENT REALLY FAILED
            // ========================================================

            await this.subscriptionPaymentRepository.update(
                {
                    id: payment.id,
                },
                {
                    status:
                        PaymentStatus.FAILED,

                    failure_reason:
                        verification.message ||
                        'SELCOM payment failed',
                },
            );

            this.logger.warn(
                `SELCOM PAYMENT FAILED. ` +
                `Payment ID=${payment.id}`,
            );

            return {
                success: false,
                message:
                    verification.message ||
                    'Payment failed',
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

    async handleSnippeWebhook(
        event: any,
    ) {
        try {

            // --------------------------------------------------------
            // LOG FULL WEBHOOK
            // --------------------------------------------------------

            this.logger.log(
                `Snippe webhook received: ${JSON.stringify(event)}`,
            );

            // --------------------------------------------------------
            // EVENT TYPE
            // --------------------------------------------------------

            const eventType =
                event?.type ||
                event?.event;

            this.logger.log(
                `Snippe event type: ${eventType}`,
            );

            // --------------------------------------------------------
            // SNIPPE PAYMENT REFERENCE
            //
            // Example:
            // SN1787557846088555
            // --------------------------------------------------------

            const snippeReference =
                event?.data?.reference ||
                event?.reference;

            // --------------------------------------------------------
            // YOUR INTERNAL REFERENCE
            //
            // Example:
            // SUB_1787557845327_2D5AFCC55
            //
            // This is what you stored in:
            // subscription_payments.transaction_id
            // --------------------------------------------------------

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

            // --------------------------------------------------------
            // REFERENCE REQUIRED
            // --------------------------------------------------------

            if (!internalReference) {

                this.logger.error(
                    `Internal payment reference missing from webhook: ${JSON.stringify(event)}`,
                );

                throw new BadRequestException(
                    'Internal payment reference not found in Snippe webhook',
                );
            }

            // --------------------------------------------------------
            // FIND PAYMENT USING OUR REFERENCE
            // --------------------------------------------------------

            const payment =
                await this.subscriptionPaymentRepository.findOne({

                    where: {

                        transaction_id:
                            internalReference,

                    },

                });

            if (!payment) {

                this.logger.error(
                    `Payment not found using internal reference: ${internalReference}`,
                );

                throw new NotFoundException(
                    `Payment not found: ${internalReference}`,
                );
            }

            this.logger.log(
                `Payment found: ID=${payment.id}, status=${payment.status}`,
            );

            // --------------------------------------------------------
            // ALREADY PROCESSED
            // --------------------------------------------------------

            if (
                payment.status ===
                PaymentStatus.SUCCESS
            ) {
                // Retry registration verification email if a previous
                // delivery attempt failed after the payment succeeded.
                await this.sendRegistrationVerificationEmailIfRequired(
                    payment,
                );

                return {

                    success: true,

                    message:
                        'Payment already processed',

                };
            }

            // --------------------------------------------------------
            // HANDLE FAILED PAYMENT
            // --------------------------------------------------------

            if (
                eventType === 'payment.failed' ||
                eventType === 'payment.expired' ||
                eventType === 'payment.voided'
            ) {

                await this.subscriptionPaymentRepository.update(

                    {
                        id: payment.id,
                    },

                    {
                        status:
                            PaymentStatus.FAILED,
                    },

                );

                this.logger.warn(
                    `Payment marked as failed: ${internalReference}`,
                );

                return {

                    success: true,

                    message:
                        'Payment marked as failed',

                };
            }

            // --------------------------------------------------------
            // ONLY PROCESS COMPLETED PAYMENT
            // --------------------------------------------------------

            if (
                eventType !== 'payment.completed'
            ) {

                this.logger.log(
                    `Ignoring Snippe event: ${eventType}`,
                );

                return {

                    success: true,

                    message:
                        'Webhook event ignored',

                };
            }

            // --------------------------------------------------------
            // CHECK SNIPPE REFERENCE
            // --------------------------------------------------------

            if (!snippeReference) {

                this.logger.error(
                    `Snippe reference missing for payment: ${internalReference}`,
                );

                throw new BadRequestException(
                    'Snippe payment reference is missing',
                );
            }

            // --------------------------------------------------------
            // CHECK WEBHOOK STATUS
            // --------------------------------------------------------

            const webhookStatus =
                event?.data?.status;

            this.logger.log(
                `Snippe webhook payment status: ${webhookStatus}`,
            );

            if (
                webhookStatus !== 'completed'
            ) {

                this.logger.warn(
                    `Payment webhook received but status is ${webhookStatus}`,
                );

                return {

                    success: false,

                    message:
                        `Payment is not completed. Current status: ${webhookStatus}`,

                };
            }

            // --------------------------------------------------------
            // VERIFY PAYMENT WITH SNIPPE - FIXED: Pass provider name
            // --------------------------------------------------------

            const provider =
                this.paymentProviderFactory.getProvider('snippe');

            const verification =
                await provider.verify({

                    reference:
                        snippeReference,

                });

            this.logger.log(
                `Snippe verification result: ${JSON.stringify({
                    success: verification.success,
                    transactionId: verification.transactionId,
                    message: verification.message,
                })}`,
            );

            if (
                !verification.success
            ) {

                this.logger.error(
                    `Snippe payment verification failed: ${snippeReference}`,
                );

                return {

                    success: false,

                    message:
                        'Payment verification failed',

                };
            }

            // --------------------------------------------------------
            // ACTIVATE SUBSCRIPTION
            // --------------------------------------------------------

            await this.activateSubscription(
                payment.id,
            );

            await this.sendRegistrationVerificationEmailIfRequired(
                payment,
            );

            this.logger.log(
                `Subscription successfully activated for payment ${payment.id}`,
            );

            return {

                success: true,

                message:
                    'Snippe payment processed successfully',

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
    private async activateSubscription(
        paymentId: number,
    ) {

        const queryRunner =
            this.dataSource.createQueryRunner();

        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {

            // ========================================================
            // LOCK PAYMENT
            // ========================================================

            const payment =
                await queryRunner.manager
                    .createQueryBuilder(
                        SubscriptionPayment,
                        'payment',
                    )
                    .setLock(
                        'pessimistic_write',
                    )
                    .where(
                        'payment.id = :paymentId',
                        {
                            paymentId,
                        },
                    )
                    .getOne();


            if (!payment) {

                throw new NotFoundException(
                    'Payment not found',
                );
            }


            // ========================================================
            // USER REQUIRED
            // ========================================================

            if (!payment.user_id) {

                throw new BadRequestException(
                    'Payment is not linked to a user account',
                );
            }


            // ========================================================
            // CHECK EXISTING SUBSCRIPTION
            // ========================================================

            const existingSubscription =
                await queryRunner.manager.findOne(
                    Subscription,
                    {
                        where: {
                            subscription_payment_id:
                                payment.id,
                        },
                    },
                );


            if (existingSubscription) {

                await queryRunner.commitTransaction();

                return existingSubscription;
            }


            // ========================================================
            // PLAN
            // ========================================================

            const plan =
                await queryRunner.manager.findOne(
                    SubscriptionPlan,
                    {
                        where: {
                            id:
                                payment.subscription_plan_id,
                        },
                    },
                );


            if (!plan) {

                throw new NotFoundException(
                    'Subscription plan not found',
                );
            }


            // ========================================================
            // DEACTIVATE OLD
            // ========================================================

            await queryRunner.manager.update(
                Subscription,

                {
                    user_id:
                        payment.user_id,

                    is_active:
                        true,
                },

                {
                    is_active:
                        false,
                },
            );


            // ========================================================
            // DATES
            // ========================================================

            const startDate =
                new Date();

            const endDate =
                new Date(
                    startDate,
                );

            endDate.setDate(
                endDate.getDate() +
                Number(
                    plan.duration_days,
                ),
            );


            // ========================================================
            // CREATE SUBSCRIPTION
            // ========================================================

            const subscription =
                queryRunner.manager.create(
                    Subscription,
                    {
                        user_id:
                            payment.user_id,

                        subscription_plan_id:
                            plan.id,

                        start_date:
                            startDate,

                        end_date:
                            endDate,

                        job_post_remaining:
                            plan.job_post_limit ??
                            -1,

                        cv_download_remaining:
                            plan.cv_download_limit ??
                            -1,

                        cv_builder_remaining:
                            plan.cv_builder_limit ??
                            -1,

                        is_active:
                            true,

                        subscription_payment_id:
                            payment.id,
                    },
                );


            await queryRunner.manager.save(
                Subscription,
                subscription,
            );


            // ========================================================
            // MARK PAYMENT SUCCESS
            // ========================================================

            payment.status =
                PaymentStatus.SUCCESS;

            payment.paid_at =
                payment.paid_at ||
                new Date();


            await queryRunner.manager.save(
                SubscriptionPayment,
                payment,
            );


            await queryRunner.commitTransaction();

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

    // Add to PaymentService

    // ============================================================
    // LIST ALL PAYMENTS (with pagination)
    // ============================================================
    async listSnippePayments(
        limit: number = 20,
        offset: number = 0
    ) {
        const provider = this.paymentProviderFactory.getProvider('snippe');

        const response = await provider.listPayments({
            limit,
            offset
        });

        return response;
    }

    // ============================================================
    // GET ACCOUNT BALANCE
    // ============================================================
    async getSnippeBalance() {
        const provider = this.paymentProviderFactory.getProvider('snippe');

        const balance = await provider.getBalance();

        return {
            success: true,
            data: balance,
            message: 'Account balance retrieved successfully'
        };
    }

    // ============================================================
    // SEARCH PAYMENTS
    // ============================================================
    async searchSnippePayments(reference: string) {
        const provider = this.paymentProviderFactory.getProvider('snippe');

        const results = await provider.searchPayments({
            reference
        });

        return {
            success: true,
            data: results,
            message: 'Payment search completed'
        };
    }

    // ============================================================
    // TRIGGER USSD PUSH
    // ============================================================
    async triggerUssdPush(reference: string) {
        const provider = this.paymentProviderFactory.getProvider('snippe');

        const result = await provider.triggerUssdPush({
            reference
        });

        return {
            success: true,
            data: result,
            message: 'USSD push triggered successfully'
        };
    }

    // ============================================================
    // ALL SUBSCRIPTION PAYMENTS
    // SEARCH + PAGINATION
    // ============================================================

    async getSubscriptionPayments(
        user: Users,
        query: SubscriptionPaymentsQueryDto,
    ) {

        try {

            const page =
                Number(query.page) || 1;

            const limit =
                Number(query.limit) || 20;

            const skip =
                (page - 1) * limit;

            const search =
                query.search?.trim() || '';


            // ========================================================
            // QUERY BUILDER
            // ========================================================
            const queryBuilder =
                this.subscriptionPaymentRepository
                    .createQueryBuilder('payment')

                    .leftJoinAndSelect(
                        'payment.subscriptionPlan',
                        'plan',
                    )

                    .where(
                        'payment.user_id = :userId',
                        {
                            userId: user.id,
                        },
                    )

                    // Client / Employer only
                    .andWhere(
                        'payment.role = :role',
                        {
                            role: PaymentRole.EMPLOYER,
                        },
                    )

                    // Only successful payments
                    .andWhere(
                        'payment.status = :status',
                        {
                            status: 'success',
                        },
                    );


            // ========================================================
            // SEARCH
            // ========================================================

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
                    {
                        search: `%${search}%`,
                    },
                );

            }


            // ========================================================
            // PAGINATION
            // ========================================================

            queryBuilder
                .orderBy(
                    'payment.created_at',
                    'DESC',
                )

                .skip(skip)

                .take(limit);


            // ========================================================
            // EXECUTE
            // ========================================================

            const [
                payments,
                total,
            ] =
                await queryBuilder.getManyAndCount();


            // ========================================================
            // RESPONSE
            // ========================================================

            return {

                success: true,

                message:
                    'Subscription payments retrieved successfully',

                data: payments.map(
                    (payment) => ({

                        id:
                            payment.id,

                        subscription_plan_id:
                            payment.subscription_plan_id,

                        plan:
                            payment.subscriptionPlan,

                        amount:
                            Number(payment.amount),

                        transaction_id:
                            payment.transaction_id,

                        provider_transaction_id:
                            payment.provider_transaction_id,

                        provider:
                            payment.provider,

                        payment_type:
                            payment.payment_type,

                        status:
                            payment.status,

                        paid_at:
                            payment.paid_at,

                        failure_reason:
                            payment.failure_reason,

                        role:
                            payment.role,

                        created_at:
                            payment.created_at,

                        updated_at:
                            payment.updated_at,
                        meta: payment.meta,

                    }),
                ),



                page,

                limit,

                total,

                totalPages:
                    Math.ceil(
                        total / limit,
                    ),



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
    // CURRENT SUBSCRIPTION (With Full Payment Data)
    // ============================================================
    async currentSubscription(user: Users) {
        try {
            const subscription = await this.subscriptionRepository.findOne({
                where: {
                    user_id: user.id,
                    is_active: true,
                },
                relations: ['plan'],
                order: {
                    end_date: 'DESC',
                },
            });

            if (!subscription) {
                return {
                    success: false,
                    message: 'No active subscription',
                    data: [],
                };
            }

            // Check expiration
            if (new Date(subscription.end_date) < new Date()) {
                subscription.is_active = false;
                await this.subscriptionRepository.save(subscription);

                return {
                    success: false,
                    message: 'Subscription has expired',
                    data: [],
                };
            }

            // ========================================================
            // FETCH PAYMENT DATA
            // ========================================================

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

            // ========================================================
            // CALCULATE REMAINING DAYS
            // ========================================================

            const now = new Date();
            const endDate = new Date(subscription.end_date);

            const remainingDays = Math.max(
                0,
                Math.ceil(
                    (endDate.getTime() - now.getTime()) /
                    (1000 * 60 * 60 * 24),
                ),
            );

            // ========================================================
            // RETURN ARRAY
            // ========================================================

            return {
                success: true,
                message: 'Current subscription retrieved successfully',

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



}