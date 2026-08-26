import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
    Unique,
} from 'typeorm';

import { SubscriptionPlan } from './subscription-plan.entity';
import { SubscriptionFeature } from './subscription-feature.entity';

@Entity('plan_features')
@Unique('UQ_PLAN_FEATURE', ['plan_id', 'feature_id'])
export class PlanFeature {

    @PrimaryGeneratedColumn()
    id: number;

    // ---------------------------------------------
    // PLAN
    // ---------------------------------------------

    @Column({
        type: 'int',
        name: 'plan_id',
    })
    plan_id: number;

    @ManyToOne(
        () => SubscriptionPlan,
        plan => plan.planFeatures,
        {
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
        },
    )
    @JoinColumn({
        name: 'plan_id',
        referencedColumnName: 'id',
    })
    plan: SubscriptionPlan;

    // ---------------------------------------------
    // FEATURE
    // ---------------------------------------------

    @Column({
        type: 'int',
        name: 'feature_id',
    })
    feature_id: number;

    @ManyToOne(
        () => SubscriptionFeature,
        feature => feature.planFeatures,
        {
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
        },
    )
    @JoinColumn({
        name: 'feature_id',
        referencedColumnName: 'id',
    })
    feature: SubscriptionFeature;

    // ---------------------------------------------
    // AUDIT
    // ---------------------------------------------

    @Column({
        type: 'int',
        nullable: true,
        name: 'creator_id',
    })
    creator_id: number | null;

    @Column({
        type: 'int',
        nullable: true,
        name: 'updator_id',
    })
    updator_id: number | null;

    // ---------------------------------------------
    // TIMESTAMPS
    // ---------------------------------------------

    @CreateDateColumn({
        type: 'timestamp',
        name: 'created_at',
    })
    created_at: Date;

    @UpdateDateColumn({
        type: 'timestamp',
        name: 'updated_at',
    })
    updated_at: Date;
}