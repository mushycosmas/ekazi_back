import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    OneToMany,
    ManyToOne,
    JoinColumn,
} from 'typeorm';

import { Jobs } from 'src/jobs/entities/job.entity';
import { Countries } from 'src/entities/countries.entity';
import { Industries } from 'src/entities/industries.entity';
import { Users } from 'src/entities/users.entity';
import { JobAlerts } from 'src/jobs/entities/job-alerts.entity';
import { JobPlans } from 'src/jobs/entities/job-plans.entity';
import { ClientSubscriptionPayments } from './client-subscription-payments.entity';

@Entity('clients')
export class Clients {
    @PrimaryGeneratedColumn({ unsigned: true })
    id: number;

    @Column({ nullable: true })
    user_id: number;

    @Column({ length: 100 })
    client_name: string;

    @Column({ nullable: true, length: 100 })
    tin: string;

    @Column({ nullable: true })
    type_id: number;

    @Column({ length: 100 })
    business: string;

    @Column()
    industry_id: number;

    @Column({ nullable: true })
    country_id: number;

    @Column({ nullable: true })
    company_size_id: number;

    @Column({
        type: 'timestamp',
        nullable: true,
    })
    founded_year: Date;

    @Column('text')
    additional_info: string;

    @Column({
        nullable: true,
        length: 100,
    })
    logo: string;

    @Column({ default: false })
    hide: boolean;

    @Column({ default: false })
    featured: boolean;

    @Column({ nullable: true })
    creator_id: number;

    @Column({ nullable: true })
    updator_id: number;

    @Column({
        type: 'datetime',
        nullable: true,
    })
    created_at: Date;

    @Column({
        type: 'datetime',
        nullable: true,
    })
    updated_at: Date;

    @Column({ default: 1 })
    is_verified: number;

    @Column({
        type: 'datetime',
    })
    verified_at: Date;

    @Column('text')
    verified_note: string;

    /*
    |--------------------------------------------------------------------------
    | RELATIONS
    |--------------------------------------------------------------------------
    */

    @ManyToOne(() => Users)
    @JoinColumn({ name: 'user_id' })
    user: Users;

    @ManyToOne(() => Industries)
    @JoinColumn({ name: 'industry_id' })
    industry: Industries;

    @ManyToOne(() => Countries)
    @JoinColumn({ name: 'country_id' })
    country: Countries;

    @OneToMany(() => Jobs, (job) => job.client)
    jobs: Jobs[];
    @OneToMany(() => JobAlerts, (jobAlert) => jobAlert.client,)
    jobAlerts: JobAlerts[];

    @OneToMany(
        () => JobPlans,
        (jobPlan) => jobPlan.client,
    )
    jobPlans: JobPlans[];
    @OneToMany(
        () => ClientSubscriptionPayments,
        (payment) => payment.client,
    )
    clientSubscriptionPayments: ClientSubscriptionPayments[];

}