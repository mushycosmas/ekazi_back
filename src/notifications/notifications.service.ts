import {
    Injectable,
    Logger,
    OnModuleInit,
    OnModuleDestroy,
    NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Subject } from 'rxjs';
import { filter, map } from 'rxjs/operators';

import { SubscriptionPayment } from 'src/payment/entities/subscription-payment.entity';
import { Email } from 'src/entities/e-mail.entity';
import { Notification } from 'src/client/entities/notifications.entity';

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
        @InjectRepository(Notification)
        private readonly notificationRepo: Repository<Notification>,
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
        applicantId?: number;
        clientId?: number;
        jobId?: number;
        type: string;
        message: string;
    }) {
        const notification = new Notification();

        notification.user_id = data.senderId;
        notification.user_to_notify = data.receiverId;
        notification.applicant_id = data.applicantId ?? null;
        notification.client_id = data.clientId ?? null;
        notification.job_id = data.jobId ?? null;
        notification.type = data.type;
        notification.data = data.message;
        notification.readed = false;

        return this.notificationRepo.save(notification);
    }

    async getAllNotifications(
        userId: number,
        page = 1,
        limit = 20,
    ) {
        page = Math.max(1, Number(page) || 1);
        limit = Math.min(100, Math.max(1, Number(limit) || 20));

        const [notifications, total] =
            await this.notificationRepo.findAndCount({
                where: {
                    user_to_notify: userId,
                },
                relations: {
                    user: true,
                    notifyUser: true,
                    applicant: true,
                    client: true,
                    job: true,
                },
                order: {
                    created_at: 'DESC',
                },
                skip: (page - 1) * limit,
                take: limit,
            });

        const unreadCount = await this.notificationRepo.count({
            where: {
                user_to_notify: userId,
                readed: false,
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


    async getNotifications(
        userId: number,
        page = 1,
        limit = 20,
    ) {
        page = Math.max(1, Number(page) || 1);
        limit = Math.min(100, Math.max(1, Number(limit) || 20));

        const [notifications, total] =
            await this.notificationRepo.findAndCount({
                where: {
                    user_to_notify: userId,
                },
                relations: {
                    user: true,
                    notifyUser: true,
                    applicant: true,
                    client: true,
                    job: {
                        position: true,
                    },
                },
                order: {
                    created_at: 'DESC',
                },
                skip: (page - 1) * limit,
                take: limit,
            });

        const unreadCount = await this.notificationRepo.count({
            where: {
                user_to_notify: userId,
                readed: false,
            },
        });

        const data = notifications.map((notification) => {
            let message = notification.data;

            const position = notification.job?.position?.position_name || 'the position';

            switch (notification.type) {
                case 'job-application':
                    message = `A candidate has submitted an application for the ${position} position.`;
                    break;

                case 'application-submitted':
                    message = `You have submitted an application for the ${position} position.`;
                    break;

                case 'new-applicant':
                    message = 'A new applicant has registered on the system.';
                    break;

                case 'job-stage':
                    message = `Your application for the ${position} position has moved to a new stage.`;
                    break;

                case 'account-created':
                    message = `Your eKazi account has been successfully created.`;
                    break;

                case 'application-rejected':
                    message = `Your application for the ${position} position was not successful.`;
                    break;

                case 'application-shortlisted':
                    message = `Congratulations! You have been shortlisted for the ${position} position.`;
                    break;

                case 'interview':
                    message = `You have an interview update for the ${position} position.`;
                    break;

                default:
                    message = notification.data;
            }

            return {
                id: notification.id,
                type: notification.type,
                message,
                readed: notification.readed,
                created_at: notification.created_at,
                user: notification.user
                    ? {
                        id: notification.user.id,
                    }
                    : null,
            };
        });

        return {
            success: true,
            data,
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
        const result = await this.notificationRepo.update(
            {
                id: notificationId,
                user_to_notify: userId,
                readed: false,
            },
            {
                readed: true,
            },
        );

        return {
            success: true,
            message: 'Notification marked as read',
            updated: result.affected ?? 0,
        };
    }

    async markAllAsRead(userId: number) {
        const result = await this.notificationRepo.update(
            {
                user_to_notify: userId,
                readed: false,
            },
            {
                readed: true,
            },
        );

        return {
            success: true,
            message: 'All notifications marked as read',
            updated: result.affected ?? 0,
        };
    }

    async deleteNotification(
        notificationId: number,
        userId: number,
    ) {
        const notification = await this.notificationRepo.findOne({
            where: {
                id: notificationId,
                user_to_notify: userId,
            },
        });

        if (!notification) {
            throw new NotFoundException(
                'Notification not found.',
            );
        }
        await this.notificationRepo.remove(notification);
        return {
            success: true,
            message: 'Notification deleted successfully.',
        };
    }

    async deleteAllNotifications(userId: number) {
        await this.notificationRepo.delete({
            user_to_notify: userId,
        });
        return {
            success: true,
            message: 'All notifications deleted successfully.',
        };
    }
}