import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';



import { Applicants } from 'src/entities/applicants/applicants.entity';
import { Jobs } from './job.entity';
import { JobStage } from './job-stage.entity';

@Entity('job_test_results')
export class JobTestResult {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    applicant_id: number;

    @Column()
    job_id: number;

    @Column()
    job_stage_id: number;

    @Column({
        type: 'date',
        nullable: true,
    })
    test_date?: Date;

    @Column({
        type: 'double',
        nullable: true,
    })
    aptitude_score: number;

    @Column({
        type: 'double',
        nullable: true,
    })
    proficiency_score: number;

    @Column({
        type: 'varchar',
        length: 100,
    })
    test_duration: string;

    @Column({
        type: 'varchar',
        length: 100,
    })
    test_deadline: string;

    @Column({
        type: 'varchar',
        length: 100,
        nullable: true,
    })
    user_password?: string;

    @Column({
        type: 'varchar',
        length: 100,
        nullable: true,
    })
    user_name?: string;

    @CreateDateColumn({
        type: 'datetime',
        default: () => 'CURRENT_TIMESTAMP',
    })
    created_at: Date;

    @UpdateDateColumn({
        type: 'datetime',
        default: () => 'CURRENT_TIMESTAMP',
        onUpdate: 'CURRENT_TIMESTAMP',
    })
    updated_at: Date;

    @Column({
        nullable: true,
    })
    creator_id: number;

    @Column({
        nullable: true,
    })
    updator_id: number;

    @Column({
        type: 'boolean',
        default: false,
    })
    reminder_sent_12hr: boolean;

    @Column({
        type: 'boolean',
        default: false,
    })
    reminder_sent_18hr: boolean;

    // ==========================
    // Relationships
    // ==========================

    @ManyToOne(() => Applicants)
    @JoinColumn({ name: 'applicant_id' })
    applicant: Applicants;

    @ManyToOne(() => Jobs)
    @JoinColumn({ name: 'job_id' })
    job: Jobs;

    @ManyToOne(() => JobStage)
    @JoinColumn({ name: 'job_stage_id' })
    jobStage: JobStage;
}