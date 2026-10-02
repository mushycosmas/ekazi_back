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
        unsigned: true,
    })
    id: number;

    @Column({
        type: 'int',
        unsigned: true,
    })
    evaluation_id: number;

    /**
     * Example:
     *
     * Dress
     * Grooming
     * Body Language
     * Eye Contact
     */
    @Column({
        type: 'varchar',
        length: 255,
    })
    name: string;

 

    @Column({
        type: 'tinyint',
        default: 0,
    })
    hide: number;

 

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

    @CreateDateColumn({
        type: 'datetime',
        nullable: true,
    })
    created_at: Date | null;

    @UpdateDateColumn({
        type: 'datetime',
        nullable: true,
    })
    updated_at: Date | null;

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