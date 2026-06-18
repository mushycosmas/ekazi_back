import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
} from 'typeorm';

import { Jobs } from './job.entity';

@Entity('job_application_options')
export class JobApplicationOptions {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    subscribe: number;

    @Column({
        type: 'boolean',
        default: false,
    })
    cv: boolean;

    @Column({
        type: 'boolean',
        default: false,
    })
    cover_letter: boolean;

    @Column({
        type: 'boolean',
        default: false,
        nullable: true,
    })
    certificate: boolean | null;

    @Column({
        nullable: true,
    })
    job_id: number | null;

    @Column({
        type: 'timestamp',
    })
    created_at: Date;

    @Column({
        type: 'timestamp',
    })
    updated_at: Date;

    // ======================
    // Relations
    // ======================

    @ManyToOne(
        () => Jobs,
        (job) => job.applicationOptions,
    )
    @JoinColumn({ name: 'job_id' })
    job: Jobs;
}