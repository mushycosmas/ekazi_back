import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';

 

import { Users } from 'src/entities/users.entity';
import { Clients } from '../clients.entity';
import { Jobs } from 'src/jobs/entities/job.entity';
import { Applicants } from 'src/entities/applicants/applicants.entity';

@Entity('notifications')
export class Notification {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'int', nullable: true })
    user_id: number;

    @Column({ type: 'int', nullable: true })
    plan_id: number;

    @Column({ type: 'int', nullable: true })
    applicant_id: number;

    @Column({ type: 'int', nullable: true })
    client_id: number;

    @Column({ type: 'int', nullable: true })
    user_to_notify: number;

    @Column({ type: 'varchar', length: 100 })
    type: string;

    @Column({ type: 'varchar', length: 200 })
    data: string;

    @Column({ type: 'boolean', default: false })
    readed: boolean;

    @Column({ type: 'int', nullable: true })
    job_id: number;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    // =========================
    // Relations
    // =========================

    @ManyToOne(() => Users, { nullable: true })
    @JoinColumn({ name: 'user_id' })
    user: Users;

    @ManyToOne(() => Users, { nullable: true })
    @JoinColumn({ name: 'user_to_notify' })
    notifyUser: Users;

    @ManyToOne(() => Clients, { nullable: true })
    @JoinColumn({ name: 'client_id' })
    client: Clients;

    @ManyToOne(() => Jobs, { nullable: true })
    @JoinColumn({ name: 'job_id' })
    job: Jobs;

    @ManyToOne(() => Applicants, { nullable: true })
    @JoinColumn({ name: 'applicant_id' })
    applicant: Applicants;
}