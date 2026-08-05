import {Entity, Column, CreateDateColumn, DeleteDateColumn, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { ApplicantFeaturedPlanSubscription } from './applicant-featured-plan-subscription.entity';


@Entity('applicant_featured_plans')
export class ApplicantFeaturedPlan {

    @PrimaryGeneratedColumn()
    id: number;


    @Column({
        type: 'int',
        nullable: true,
    })
    creator_id: number | null;


    @Column({
        type: 'varchar',
        length: 200,
    })
    name: string;


    @Column({
        type: 'int',
    })
    amount: number;


    @DeleteDateColumn({
        type: 'timestamp',
        nullable: true,
    })
    deleted_at: Date | null;


    @CreateDateColumn({
        type: 'timestamp',
    })
    created_at: Date;


    @UpdateDateColumn({
        type: 'datetime',
    })
    updated_at: Date;


    @OneToMany(
        () => ApplicantFeaturedPlanSubscription,
        subscription => subscription.plan
    )
    subscriptions: ApplicantFeaturedPlanSubscription[];

}