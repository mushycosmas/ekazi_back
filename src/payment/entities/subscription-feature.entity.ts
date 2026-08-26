import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,
} from 'typeorm';

import { PlanFeature } from './plan-feature.entity';

@Entity('subscription_features')
export class SubscriptionFeature {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        type: 'text',
        name: 'feature_name',
    })
    feature_name: string;

    @CreateDateColumn({
        name: 'created_at',
        type: 'timestamp',
    })
    created_at: Date;

    @UpdateDateColumn({
        name: 'updated_at',
        type: 'timestamp',
    })
    updated_at: Date;

    // ---------------------------------------------
    // RELATION
    // ---------------------------------------------

    @OneToMany(
        () => PlanFeature,
        planFeature => planFeature.feature,
    )
    planFeatures: PlanFeature[];
}