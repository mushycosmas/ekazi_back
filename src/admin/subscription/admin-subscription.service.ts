// admin-subscription.service.ts - Admin-specific logic
import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Brackets, DataSource } from 'typeorm';


import { Subscription } from 'src/payment/entities/subscription.entity';
import { Clients } from 'src/client/clients.entity';
import { Applicants } from 'src/entities/applicants/applicants.entity';
import { SubscriptionPayment } from 'src/payment/entities/subscription-payment.entity';
import { SubscriptionPlan } from 'src/payment/entities/subscription-plan.entity';
import { PaymentProviderFactory } from 'src/payment/providers/payment-provider.factory';

@Injectable()
export class AdminSubscriptionService {
    private readonly adminLogger = new Logger(AdminSubscriptionService.name);

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
    ) {

    }

    // ============================================================
    // ADMIN-SPECIFIC METHODS
    // ============================================================

    // ============================================================
    // GET ALL SUBSCRIPTIONS
    // WITH PAYMENT DATA
    // ============================================================
    async getAllSubscriptions(
        page: number = 1,
        limit: number = 20,
        search?: string,
    ) {
        try {

            // ========================================================
            // PAGINATION
            // ========================================================

            page = Math.max(1, Number(page) || 1);

            limit = Math.max(1, Number(limit) || 20);

            limit = Math.min(limit, 100);

            const skip =
                (page - 1) * limit;


            // ========================================================
            // QUERY BUILDER
            // ========================================================

            const query =
                this.subscriptionRepository
                    .createQueryBuilder('subscription')
                    .leftJoinAndSelect(
                        'subscription.plan',
                        'plan',
                    );


            // ========================================================
            // SEARCH
            // ========================================================

            if (search?.trim()) {

                const keyword =
                    `%${search.trim()}%`;

                query.andWhere(
                    `
                (
                    CAST(subscription.user_id AS CHAR) LIKE :search
                    OR CAST(subscription.subscription_plan_id AS CHAR) LIKE :search
                    OR CAST(subscription.subscription_payment_id AS CHAR) LIKE :search
                    OR CAST(subscription.is_active AS CHAR) LIKE :search

                    OR CAST(plan.id AS CHAR) LIKE :search
                    OR plan.name LIKE :search
                )
                `,
                    {
                        search: keyword,
                    },
                );

            }


            // ========================================================
            // ORDER + PAGINATION
            // ========================================================

            query
                .orderBy(
                    'subscription.created_at',
                    'DESC',
                )
                .skip(skip)
                .take(limit);


            const [
                subscriptions,
                total,
            ] =
                await query.getManyAndCount();


            // ========================================================
            // NO DATA
            // ========================================================

            if (!subscriptions.length) {

                return {

                    success: false,
                    message:
                        search
                            ? `No subscriptions found for "${search}"`
                            : 'No subscriptions found',

                    data: [],
                    page,
                    limit,
                    total: 0,
                    totalPages: 0,

                };

            }


            // ========================================================
            // PAYMENT DATA
            // ========================================================

            const data =
                await Promise.all(

                    subscriptions.map(
                        async (subscription) => {

                            let paymentData: any = null;


                            if (
                                subscription.subscription_payment_id
                            ) {

                                const payment =
                                    await this.subscriptionPaymentRepository.findOne({

                                        where: {

                                            id:
                                                subscription.subscription_payment_id,

                                        },

                                    });


                                if (payment) {

                                    paymentData = {

                                        id:
                                            payment.id,

                                        amount:
                                            Number(
                                                payment.amount,
                                            ),

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

                                        role:
                                            payment.role,

                                        paid_at:
                                            payment.paid_at,

                                        failure_reason:
                                            payment.failure_reason,

                                        meta:
                                            payment.meta,

                                        created_at:
                                            payment.created_at,

                                        updated_at:
                                            payment.updated_at,

                                    };

                                }

                            }


                            // ====================================================
                            // REMAINING DAYS
                            // ====================================================

                            const now =
                                new Date();

                            const endDate =
                                new Date(
                                    subscription.end_date,
                                );


                            const remainingDays =
                                Math.max(

                                    0,

                                    Math.ceil(

                                        (
                                            endDate.getTime()
                                            -
                                            now.getTime()
                                        )
                                        /
                                        (
                                            1000 *
                                            60 *
                                            60 *
                                            24
                                        ),

                                    ),

                                );


                            // ====================================================
                            // RETURN
                            // ====================================================

                            return {

                                id:
                                    subscription.id,

                                user_id:
                                    subscription.user_id,

                                subscription_plan_id:
                                    subscription.subscription_plan_id,

                                plan:
                                    subscription.plan,

                                start_date:
                                    subscription.start_date,

                                end_date:
                                    subscription.end_date,

                                remaining_days:
                                    remainingDays,

                                job_post_remaining:
                                    subscription.job_post_remaining,

                                cv_download_remaining:
                                    subscription.cv_download_remaining,

                                cv_builder_remaining:
                                    subscription.cv_builder_remaining,

                                is_active:
                                    subscription.is_active,

                                subscription_payment_id:
                                    subscription.subscription_payment_id,

                                payment:
                                    paymentData,

                                created_at:
                                    subscription.created_at,

                                updated_at:
                                    subscription.updated_at,

                            };

                        },
                    ),

                );


            // ========================================================
            // PAGINATION INFORMATION
            // ========================================================

            const totalPages =
                Math.ceil(
                    total / limit,
                );


            return {

                success: true,
                message:'All subscriptions retrieved successfully',
                data,
                page,
                limit,
                total,
                totalPages,
            };


        } catch (error) {
            throw new InternalServerErrorException(
                'Failed to fetch subscriptions',
            );

        }
    }

    /**
     * Get subscription statistics
     * Admin only
     */
    async getSubscriptionStatistics() {
        try {
            const now = new Date();

            const totalSubscriptions = await this.subscriptionRepository.count();
            const activeSubscriptions = await this.subscriptionRepository.count({
                where: { is_active: true },
            });

            // ... rest of statistics logic

            return {
                total_subscriptions: totalSubscriptions,
                active_subscriptions: activeSubscriptions,
                // ... more stats
            };
        } catch (error) {
            this.adminLogger.error('Error getting statistics:', error);
            return null;
        }
    }

    /**
     * Admin-only: Export subscriptions
     */
    async adminExportSubscriptionsCSV(filters: any) {
        // ... CSV export logic
        return {
            csv: '...',
            count: 0,
        };
    }

    // ============================================================
    // PRIVATE HELPERS
    // ============================================================

    // private processAdminSubscriptions(subscriptions: Subscription[]) {
    //     const now = new Date();
    //     return subscriptions.map(sub => {
    //         const endDate = new Date(sub.end_date);
    //         const isExpired = endDate < now;
    //         const remainingDays = isExpired ? 0 : Math.max(0, Math.ceil(
    //             (endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    //         ));

    //         return {
    //             ...this.formatSubscription(sub),
    //             remaining_days: remainingDays,
    //             is_expired: isExpired,
    //             status: (sub.is_active && !isExpired) ? 'active' : 'expired',
    //             user: sub.user ? {
    //                 id: sub.user.id,
    //                 first_name: sub.user.username,
    //                 last_name: sub.user.username,
    //                 email: sub.user.email,
    //             } : null,
    //             plan: sub.plan ? {
    //                 id: sub.plan.id,
    //                 name: sub.plan.name,
    //                 price: sub.plan.price,
    //                 currency: sub.plan.current_type,
    //                 duration_days: sub.plan.duration_days,
    //             } : null,
    //         };
    //     });
    // }
}