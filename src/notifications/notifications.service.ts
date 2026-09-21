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
    ) {}

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

    // ========================================================
    // GUEST SUCCESS POLLER
    //
    // Rules (strictly "success only"):
    //   - user_id IS NULL           (guest)
    //   - status = 'success'        (payment really succeeded)
    //   - provider_transaction_id IS NOT NULL
    //     (SELCOM / Snippe actually issued a reference)
    //   - id > lastSeenId           (avoid replaying the same row)
    //
    // Anything pending, failed, or without a provider reference
    // is ignored — no notification goes out.
    // ========================================================
    private async pollGuestSuccess() {

        // Only look at rows created in the last 30 minutes so we
        // don't scan the whole table forever.
        const cutoff = new Date(Date.now() - 30 * 60 * 1000);

        const rows = await this.subscriptionPaymentRepository
            .createQueryBuilder('p')
            .where('p.user_id IS NULL')
            .andWhere('p.status = :status', { status: 'success' })
            .andWhere('p.provider_transaction_id IS NOT NULL')
            .andWhere('p.id > :lastId', { lastId: this.lastSeenId })
            .andWhere('p.created_at >= :cutoff', { cutoff })
            .orderBy('p.id', 'ASC')
            .take(50)
            .getMany();

        if (rows.length === 0) return;

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
                // Frontend uses this to decide what comes next
                next_step: 'continue',
            });

            this.lastSeenId = Math.max(this.lastSeenId, p.id);
        }
    }
}