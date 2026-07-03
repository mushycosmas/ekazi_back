import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';

import { Users } from 'src/entities/users.entity';
import { Jobs } from 'src/jobs/entities/job.entity';
import { Stage } from '../stage.entity';
 

@Entity('applicant_applications')
export class ApplicantApplication {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'job_id' })
    job_id: number;

    @Column({ name: 'stage_id', nullable: true })
    stage_id: number;

    @Column({ name: 'applicant_id' })
    applicant_id: number;

    @Column({ type: 'text' })
    letter: string;

    @Column({ type: 'tinyint', default: 0 })
    hide: number;

    @Column({ name: 'consent_verified', type: 'tinyint', default: 0 })
    consent_verified: number;

    @Column({ type: 'varchar', length: 100 })
    status: string;

    @Column({ type: 'varchar', length: 100, nullable: true })
    attachment: string;

    // relations (optional but recommended)
    @ManyToOne(() => Jobs, (job) => job.id)
    @JoinColumn({ name: 'job_id' })
    job: Jobs;

    @ManyToOne(() => Users, (user) => user.id)
    @JoinColumn({ name: 'applicant_id' })
    applicant: Users;

 
    // Timestamps - ONLY DECLARE ONCE!
    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    @ManyToOne(() => Stage, (stage) => stage.applications)
    @JoinColumn({ name: 'stage_id' })
    stage: Stage;
}