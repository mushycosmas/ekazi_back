import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    DeleteDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';

import { Applicants } from '../applicants/applicants.entity';
import { ApplicantFeaturedPlan } from './applicant-featured-plan.entity';


@Entity('applicant_featured_plan_subscriptions')
export class ApplicantFeaturedPlanSubscription {

    @PrimaryGeneratedColumn()
    id: number;


    @ManyToOne(
        () => Applicants,
        applicant => applicant.featuredPlanSubscriptions
    )
    @JoinColumn({
        name: 'applicant_id'
    })
    applicant: Applicants;


    @ManyToOne(
        () => ApplicantFeaturedPlan,
        plan => plan.subscriptions
    )
    @JoinColumn({
        name: 'applicant_featured_plan_id'
    })
    plan: ApplicantFeaturedPlan;


    @Column({
        type: 'int',
        default: 0,
    })
    hide: number;


    @Column({
        type: 'int',
    })
    verify: number;


    @Column({
        type: 'int',
        nullable: true,
    })
    amount: number | null;


    @CreateDateColumn()
    created_at: Date;


    @UpdateDateColumn()
    updated_at: Date | null;


    // @DeleteDateColumn()
    // deleted_at: Date | null;
    @Column({
        type: 'timestamp',
        nullable: true,
    })
    deleted_at: Date | null;
}