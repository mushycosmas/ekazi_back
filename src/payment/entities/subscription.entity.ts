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

import {
    SubscriptionPlan,
    SubscriptionTarget,
} from './subscription-plan.entity';


@Entity('subscriptions')
export class Subscription {

    @PrimaryGeneratedColumn()
    id: number;


    /*
    |--------------------------------------------------------------------------
    | USER
    |--------------------------------------------------------------------------
    */

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


    /*
    |--------------------------------------------------------------------------
    | PLAN
    |--------------------------------------------------------------------------
    */

    @Column({
        type: 'int',
    })
    subscription_plan_id: number;


    @ManyToOne(
        () => SubscriptionPlan,
        plan => plan.subscriptions,
        {
            onDelete: 'RESTRICT',
        },
    )
    @JoinColumn({
        name: 'subscription_plan_id',
    })
    plan: SubscriptionPlan;


    /*
    |--------------------------------------------------------------------------
    | TARGET
    |--------------------------------------------------------------------------
    */

     


    /*
    |--------------------------------------------------------------------------
    | SUBSCRIPTION PERIOD
    |--------------------------------------------------------------------------
    */

    @Column({
        type: 'timestamp',
    })
    start_date: Date;


    @Index()
    @Column({
        type: 'timestamp',
    })
    end_date: Date;


    /*
    |--------------------------------------------------------------------------
    | EMPLOYER LIMITS
    |--------------------------------------------------------------------------
    */

    @Column({
        type: 'int',
        default: -1,
    })
    job_post_remaining: number;


    @Column({
        type: 'int',
        default: -1,
    })
    cv_download_remaining: number;


    /*
    |--------------------------------------------------------------------------
    | APPLICANT LIMITS
    |--------------------------------------------------------------------------
    */

    @Column({
        type: 'int',
        default: -1,
    })
    cv_builder_remaining: number;


    


    /*
    |--------------------------------------------------------------------------
    | ACTIVE STATUS
    |--------------------------------------------------------------------------
    */

    @Index()
    @Column({
        type: 'boolean',
        default: true,
    })
    is_active: boolean;


    /*
    |--------------------------------------------------------------------------
    | PAYMENT
    |--------------------------------------------------------------------------
    */

    @Column({
        type: 'int',
        nullable: true,
    })
    subscription_payment_id: number | null;


    @CreateDateColumn({
        type: 'timestamp',
    })
    created_at: Date;


    @UpdateDateColumn({
        type: 'timestamp',
    })
    updated_at: Date;
}