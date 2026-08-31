import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
    Index,
} from 'typeorm';

import { Users } from 'src/entities/users.entity';
import { SubscriptionPlan } from './subscription-plan.entity';

export enum PaymentStatus {
    PENDING = 'pending',
    SUCCESS = 'success',
    FAILED = 'failed',
}

export enum PaymentRole {
    APPLICANT = 'applicant',
    EMPLOYER = 'employer',
}

@Entity('subscription_payments')
export class SubscriptionPayment {

    @PrimaryGeneratedColumn()
    id: number;

    @Index()
    @Column({
        type: 'int',
    })
    subscription_plan_id: number;

    @ManyToOne(
        () => SubscriptionPlan,
        plan => plan.payments,
        {
            onDelete: 'RESTRICT',
        },
    )
    @JoinColumn({
        name: 'subscription_plan_id',
    })
    plan: SubscriptionPlan;


    @Index()
    @Column({
        type: 'int',
    })
    user_id: number;

    @ManyToOne(
        () => Users,
        {
            onDelete: 'CASCADE',
        },
    )
    @JoinColumn({
        name: 'user_id',
    })
    user: Users;


    @Column({
        type: 'decimal',
        precision: 15,
        scale: 2,
    })
    amount: number;


    @Index({
        unique: true,
    })
    @Column({
        type: 'varchar',
        length: 255,
    })
    transaction_id: string;


    @Column({
        type: 'enum',
        enum: PaymentStatus,
        default: PaymentStatus.PENDING,
    })
    status: PaymentStatus;


    @Column({
        type: 'varchar',
        length: 300,
    })
    provider: string;


    // SUBSCRIPTION ROLE
    @Column({
        type: 'enum',
        enum: PaymentRole,
        default: PaymentRole.APPLICANT,
    })
    role: PaymentRole;

    @Column({
        type: 'varchar',
        length: 50,
        nullable: true,
    })
    payment_type: string | null;


    @Column({
        type: 'json',
        nullable: true,
    })
    meta: Record<string, any> | null;


    // @Column({
    //     type: 'varchar',
    //     length: 255,
    //     nullable: true,
    // })
    // provider_transaction_id: string | null;
    @Column({
        name: 'provider_transaction_id',
        nullable: true,
    })
    provider_transaction_id: string;


    @Column({
        type: 'timestamp',
        nullable: true,
    })
    paid_at: Date | null;


    @Column({
        type: 'varchar',
        length: 1000,
        nullable: true,
    })
    failure_reason: string | null;


    @CreateDateColumn({
        type: 'timestamp',
    })
    created_at: Date;


    @UpdateDateColumn({
        type: 'timestamp',
    })
    updated_at: Date;

    @ManyToOne(
    () => SubscriptionPlan,
)
@JoinColumn({
    name: 'subscription_plan_id',
})
subscriptionPlan: SubscriptionPlan;


}