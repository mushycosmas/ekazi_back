import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';

import { Stage } from 'src/entities/stage.entity';
import { Users } from 'src/entities/users.entity';
import { Jobs } from 'src/jobs/entities/job.entity';
import { Applicants } from 'src/entities/applicants/applicants.entity';

@Entity('job_stages')
export class JobStage {
    @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
    id: number;

    @Column({ type: 'int' })
    applicant_id: number;

    @Column({ type: 'int', unsigned: true })
    job_id: number;

    @Column({ type: 'int', unsigned: true })
    stage_id: number;

    // ======================
    // RELATIONS
    // ======================

    // JOB
    @ManyToOne(() => Jobs, (job) => job.id, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'job_id' })
    job: Jobs;

    // STAGE (Applied / Shortlisted / Interview etc.)
    @ManyToOne(() => Stage, (stage) => stage.id, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'stage_id' })
    stage: Stage;

    // APPLICANT (IMPORTANT: link to Applicants table, NOT Users)
    @ManyToOne(() => Applicants, (applicant) => applicant.id, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'applicant_id' })
    applicant: Applicants;

    // OPTIONAL: recruiter/user who moved stage
    @ManyToOne(() => Users, (user) => user.id, { nullable: true })
    @JoinColumn({ name: 'creator_id' })
    creator: Users;

    @ManyToOne(() => Users, (user) => user.id, { nullable: true })
    @JoinColumn({ name: 'updator_id' })
    updator: Users;

    // ======================
    // TIMESTAMPS
    // ======================

    @CreateDateColumn({
        type: 'timestamp',
        default: () => 'CURRENT_TIMESTAMP',
    })
    created_at: Date;

    @UpdateDateColumn({
        type: 'timestamp',
        default: () => 'CURRENT_TIMESTAMP',
        onUpdate: 'CURRENT_TIMESTAMP',
    })
    updated_at: Date;
}