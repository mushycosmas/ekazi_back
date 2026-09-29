import {
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';

@Entity('evaluation_results')
export class EvaluationResult {
    @PrimaryGeneratedColumn({
        type: 'int',
        unsigned: true,
    })
    id: number;

    @Column({
        type: 'int',
    })
    evaluation_remark_id: number;

    @Column({
        type: 'int',
        unsigned: true,
        nullable: true,
    })
    job_id: number | null;

    @Column({
        type: 'int',
    })
    updator_id: number;

    @Column({
        type: 'int',
    })
    creator_id: number;

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