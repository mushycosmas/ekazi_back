import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,
} from 'typeorm';

import { Subscription } from './subscription.entity';
import { SubscriptionPayment } from './subscription-payment.entity';
import { PlanFeature } from './plan-feature.entity';
 

export enum SubscriptionTarget {
    APPLICANT = 'applicant',
    EMPLOYER = 'employer',
}

@Entity('subscription_plans')
export class SubscriptionPlan {

    @PrimaryGeneratedColumn()
    id: number;


    @Column({
        type: 'varchar',
        length: 300,
    })
    name: string;


    @Column({
        type: 'decimal',
        precision: 15,
        scale: 2,
    })
    price: number;


    /*
    |--------------------------------------------------------------------------
    | WHO CAN USE THIS PLAN
    |--------------------------------------------------------------------------
    |
    | applicant
    | employer
    |
    */

    @Column({
        type: 'enum',
        enum: SubscriptionTarget,
    })
    role: SubscriptionTarget;


    /*
    |--------------------------------------------------------------------------
    | EMPLOYER FEATURES
    |--------------------------------------------------------------------------
    */

    @Column({
        type: 'int',
        nullable: true,
        default: null,
    })
    job_post_limit: number | null;


    @Column({
        type: 'int',
        nullable: true,
        default: null,
    })
    cv_download_limit: number | null;


    /*
    |--------------------------------------------------------------------------
    | PLAN TYPE
    |--------------------------------------------------------------------------
    |
    | monthly
    | yearly
    | trial
    | custom
    |
    */

    @Column({
        type: 'varchar',
        length: 100,
        default: 'monthly',
    })
    current_type: string;


    /*
    |--------------------------------------------------------------------------
    | SUBSCRIPTION DURATION
    |--------------------------------------------------------------------------
    */

    @Column({
        type: 'int',
    })
    duration_days: number;


    /*
    |--------------------------------------------------------------------------
    | APPLICANT FEATURES
    |--------------------------------------------------------------------------
    */

    @Column({
        type: 'int',
        nullable: true,
        default: null,
    })
    cv_builder_limit: number | null;

 


    @Column({
        type: 'boolean',
        default: false,
    })
    popular: boolean;

    /*
    |--------------------------------------------------------------------------
    | STATUS
    |--------------------------------------------------------------------------
    */

    @Column({
        type: 'boolean',
        default: true,
    })
    is_active: boolean;


    @CreateDateColumn({
        type: 'timestamp',
    })
    created_at: Date;


    @UpdateDateColumn({
        type: 'timestamp',
    })
    updated_at: Date;


    /*
    |--------------------------------------------------------------------------
    | RELATIONS
    |--------------------------------------------------------------------------
    */

    @OneToMany(
        () => Subscription,
        subscription => subscription.plan,
    )
    subscriptions: Subscription[];


    @OneToMany(
        () => SubscriptionPayment,
        payment => payment.plan,
    )
    payments: SubscriptionPayment[];

 @OneToMany(
    () => PlanFeature,
    planFeature => planFeature.plan,
)
planFeatures: PlanFeature[];
 
}