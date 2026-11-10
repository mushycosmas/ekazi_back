import {
    Injectable,
    Logger,
    OnModuleInit,
    OnModuleDestroy,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Subject } from 'rxjs';
import { filter, map } from 'rxjs/operators';

import { SubscriptionPayment } from 'src/payment/entities/subscription-payment.entity';
import { Email } from 'src/entities/notification.entity';

export interface NotificationEvent {
    channel: string;    // 'user:<id>' | 'guest'
    event: string;
    data: any;
    ts: number;
}

@Injectable()
export class NotificationsService implements OnModuleInit, OnModuleDestroy {

    private readonly logger = new Logger(NotificationsService.name);

    private readonly stream = new Subject<NotificationEvent>();

    private pollTimer?: NodeJS.Timeout;

    // Highest SubscriptionPayment.id we've already notified about.
    private lastSeenId = 0;

    constructor(
        @InjectRepository(SubscriptionPayment)
        private readonly subscriptionPaymentRepository: Repository<SubscriptionPayment>,
        @InjectRepository(Email)
        private readonly emailRepo: Repository<Email>,
    ) { }

    // ========================================================
    // LIFECYCLE
    // ========================================================
    async onModuleInit() {

        // Seed: skip everything that already exists, so a
        // restart doesn't replay old guest successes.
        const latest = await this.subscriptionPaymentRepository
            .createQueryBuilder('p')
            .select('MAX(p.id)', 'maxId')
            .getRawOne<{ maxId: number | string | null }>();

        this.lastSeenId = Number(latest?.maxId ?? 0) || 0;

        this.logger.log(
            `[Notifications] Guest success poller ready. lastSeenId=${this.lastSeenId}`,
        );

        this.pollTimer = setInterval(
            () =>
                this.pollGuestSuccess().catch((e) =>
                    this.logger.error(
                        `[Notifications] Poller error: ${e?.message || e}`,
                        e?.stack,
                    ),
                ),
            3000,
        );
    }

    onModuleDestroy() {
        if (this.pollTimer) {
            clearInterval(this.pollTimer);
            this.pollTimer = undefined;
        }
    }

    // ========================================================
    // EMIT — same signature as before
    // ========================================================
    emitToUser(
        userId: number | null | undefined,
        event: string,
        data: any,
    ) {
        const channel = this.resolveChannel(userId);

        this.logger.log(
            `Notify → channel=${channel} event=${event}`,
        );

        this.stream.next({ channel, event, data, ts: Date.now() });
    }

    // ========================================================
    // STREAMS
    // ========================================================
    streamForUser(userId: number) {
        return this.stream.asObservable().pipe(
            filter((e) => e.channel === `user:${userId}`),
            map((e) => e),
        );
    }

    streamForGuest(reference?: string) {
        return this.stream.asObservable().pipe(
            filter((e) => e.channel === 'guest'),
            filter((e) => {
                if (!reference) return true;
                const tx = String(
                    e.data?.transaction_id ||
                    e.data?.reference ||
                    '',
                );
                return tx === reference;
            }),
            map((e) => e),
        );
    }

    // ========================================================
    // INTERNAL
    // ========================================================
    private resolveChannel(userId: number | null | undefined): string {
        const n = Number(userId);
        if (!userId || Number.isNaN(n) || n <= 0) {
            return 'guest';
        }
        return `user:${n}`;
    }

    private polling = false;

    private async pollGuestSuccess() {
        if (this.polling) {
            return;
        }

        this.polling = true;

        try {
            const cutoff = new Date(Date.now() - 30 * 60 * 1000);

            const rows = await this.subscriptionPaymentRepository
                .createQueryBuilder('p')
                .where('p.user_id IS NULL')
                .andWhere('p.status = :status', {
                    status: 'success',
                })
                .andWhere('p.provider_transaction_id IS NOT NULL')
                .andWhere('p.id > :lastId', {
                    lastId: this.lastSeenId,
                })
                .andWhere('p.created_at >= :cutoff', {
                    cutoff,
                })
                .orderBy('p.id', 'ASC')
                .take(50)
                .getMany();

            for (const p of rows) {
                this.logger.log(
                    `[Notifications] Guest payment SUCCESS: id=${p.id} ref=${p.transaction_id}`,
                );

                this.emitToUser(null, 'subscription.activated', {
                    status: 'success',
                    payment_id: p.id,
                    transaction_id: p.transaction_id,
                    provider: p.provider,
                    provider_transaction_id: p.provider_transaction_id,
                    amount: Number(p.amount),
                    plan_id: p.subscription_plan_id,
                    paid_at: p.paid_at,
                    next_step: 'continue',
                });

                this.lastSeenId = Math.max(
                    this.lastSeenId,
                    p.id,
                );
            }
        } catch (e) {
            this.logger.error(
                `[Notifications] Poller error: ${e?.message || e}`,
                e?.stack,
            );
        } finally {
            this.polling = false;
        }
    }


    async createNotification(data: {
        senderId: number;
        receiverId: number;
        subject: string;
        message: string;
    }) {
        const notification = this.emailRepo.create({
            sender_id: data.senderId,
            receiver_id: data.receiverId,
            subject: data.subject,
            subject_body: data.message,
            marked: false,
            is_read: false,
        });

        return this.emailRepo.save(notification);
    }

    async getNotifications(
        userId: number,
        page = 1,
        limit = 20,
    ) {
        page = Math.max(1, Number(page) || 1);
        limit = Math.min(100, Math.max(1, Number(limit) || 20));

        const [notifications, total] =
            await this.emailRepo.findAndCount({
                where: {
                    receiver_id: userId,
                },
                order: {
                    created_at: 'DESC',
                },
                skip: (page - 1) * limit,
                take: limit,
            });

        const unreadCount = await this.emailRepo.count({
            where: {
                receiver_id: userId,
                is_read: false,
            },
        });

        return {
            success: true,
            data: notifications,
            unread_count: unreadCount,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }

    async markAsRead(
        notificationId: number,
        userId: number,
    ) {
        await this.emailRepo.update(
            {
                id: notificationId,
                receiver_id: userId,
            },
            {
                is_read: true,
            },
        );

        return {
            success: true,
            message: 'Notification marked as read',
        };
    }

    async markAllAsRead(userId: number) {
        await this.emailRepo.update(
            {
                receiver_id: userId,
                is_read: false,
            },
            {
                is_read: true,
            },
        );

        return {
            success: true,
            message: 'All notifications marked as read',
        };
    }
}