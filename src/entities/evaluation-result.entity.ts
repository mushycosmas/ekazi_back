import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { Applicants } from './applicants/applicants.entity';

@Entity('evaluation_results')
export class EvaluationResult {
    @PrimaryGeneratedColumn({
        type: 'int',
        unsigned: true,
    })
    id: number;

    @Column({
        type: 'int',
        unsigned: true,
    })
    evaluation_id: number;

    @Column({
        type: 'int',
        unsigned: true,
        nullable: true,
    })
    job_id: number | null;

    @Column({
        type: 'int',
        unsigned: true,
        nullable: true,
    })
    stage_id: number | null;

    @Column({
        type: 'int',
        unsigned: true,
        nullable: true,
    })
    applicant_id: number | null;

    /**
     * User currently performing the evaluation.
     */
    @Column({
        type: 'int',
        unsigned: true,
    })
    evaluator_id: number;

    @Column({
        type: 'int',
        unsigned: true,
    })
    criteria_id: number;

    @Column({
        type: 'int',
        unsigned: true,
        nullable: true,
    })
    prepared_id: number | null;

    @Column({
        type: 'double',
        nullable: true,
    })
    score: number | null;

    @Column({
        type: 'text',
    })
    comment: string;

    @Column({
        type: 'int',
        unsigned: true,
    })
    creator_id: number;

    @Column({
        type: 'int',
        unsigned: true,
    })
    updator_id: number;

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

    @ManyToOne(
        () => Applicants,
        { nullable: true },
    )
    @JoinColumn({
        name: 'applicant_id',
        referencedColumnName: 'id',
    })
    applicant: Applicants | null;
}