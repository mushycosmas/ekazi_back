import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    OneToMany,
    ManyToOne,
    JoinColumn
} from 'typeorm';

import { JobPlans } from 'src/jobs/entities/job-plans.entity';
import { PlanTypes } from './plan-types.entity';
import { ClientSubscriptionPayments } from 'src/client/client-subscription-payments.entity';

@Entity('plans')
export class Plans {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    priority: number;

    @Column({ length: 200 })
    name: string;

    @Column({ length: 100 })
    slug: string;

    @Column({ type: 'text' })
    plan_for: string;

    @Column()
    plan_type_id: number;

    @Column({ default: false })
    is_trial: boolean;

    @Column()
    job_post_limit: number;

    @Column({ nullable: true })
    creator_id: number;

    @Column({ nullable: true })
    updator_id: number;

    @Column({
        type: 'timestamp',
        default: () => 'CURRENT_TIMESTAMP',
    })
    created_at: Date;

    @Column({
        type: 'timestamp',
        default: () => 'CURRENT_TIMESTAMP',
    })
    updated_at: Date;

    // =========================
    // Relations
    // =========================

    @OneToMany(
        () => JobPlans,
        (jobPlan) => jobPlan.plan,
    )
    jobPlans: JobPlans[];

   
    @ManyToOne(
        () => PlanTypes,
        (planType) => planType.plans,
        {
            onDelete: 'RESTRICT',
        },
    )
    @JoinColumn({ name: 'plan_type_id' })
    planType: PlanTypes;
    @OneToMany(
        () => ClientSubscriptionPayments,
        (payment) => payment.plan,
    )
    clientSubscriptionPayments: ClientSubscriptionPayments[];
 
}