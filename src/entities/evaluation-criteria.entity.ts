import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';

import { Evaluation } from './evaluation.entity';

@Entity('evaluation_criterias')
export class EvaluationCriteria {
    @PrimaryGeneratedColumn({
        type: 'int',
    })
    id: number;

    @Column({
        type: 'int',
        unsigned: true,
    })
    evaluation_id: number;

    @Column({
        type: 'varchar',
        length: 50,
    })
    name: string;

    @Column({
        type: 'tinyint',
        width: 1,
        default: 0,
    })
    hide: number;

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

    @Column({
        type: 'int',
        unsigned: true,
        nullable: true,
    })
    creator_id: number | null;

    @Column({
        type: 'int',
        unsigned: true,
        nullable: true,
    })
    updator_id: number | null;

    @ManyToOne(
        () => Evaluation,
        evaluation => evaluation.criterias,
        {
            onDelete: 'CASCADE',
        },
    )
    @JoinColumn({
        name: 'evaluation_id',
        referencedColumnName: 'id',
    })
    evaluation: Evaluation;
}