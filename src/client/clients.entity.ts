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
import { ClientAddress } from './entities/client-address.entity';
import { ClientPhone } from './entities/client-phones.entity';
import { ClientEmail } from './entities/client-email.entity';
import { ClientDescription } from './entities/client-descriptions.entity';
import { ClientType } from './entities/client-types.entity';
import { CompanySize } from 'src/entities/company-size.entity';
import { ClientStaff } from './entities/client-staff.entity';
import { InterviewParticipantEmail } from 'src/jobs/entities/interview/interview-participant-email.entity';

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

    @OneToMany(() => ClientAddress, (address) => address.client)
    addresses: ClientAddress[];

    @OneToMany(() => ClientPhone, (phone) => phone.client)
    phones: ClientPhone[];

    @OneToMany(() => ClientEmail, (email) => email.client)
    emails: ClientEmail[];



    @OneToMany(
        () => ClientDescription,
        (description) => description.client,
    )
    descriptions: ClientDescription[];

    @ManyToOne(() => ClientType, (type) => type.clients)
    @JoinColumn({ name: 'type_id' })
    type: ClientType;

    @ManyToOne(() => CompanySize, (size) => size.clients)
    @JoinColumn({ name: 'company_size_id' })
    companySize: CompanySize;

    @OneToMany(
        () => ClientStaff,
        staff => staff.client
    )
    staff: ClientStaff[];

    @OneToMany(
        () => InterviewParticipantEmail,
        participant => participant.client,
    )
    interviewParticipantEmails: InterviewParticipantEmail[];

}