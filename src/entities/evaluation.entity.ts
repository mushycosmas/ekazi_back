import {
    Column,
    CreateDateColumn,
    Entity,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';

import { EvaluationCriteria } from './evaluation-criteria.entity';

@Entity('evaluations')
export class Evaluation {

    @PrimaryGeneratedColumn({
        type: 'int',
        unsigned: true,
    })
    id: number;

    /**
     * Client who owns this evaluation template
     */
    @Column({
        type: 'int',
        unsigned: true,
    })
    client_id: number;

    /**
     * Example:
     * PART A
     * PART B
     * PART C
     */
    @Column({
        type: 'varchar',
        length: 255,
    })
    group: string;

    /**
     * Display order
     */
    @Column({
        type: 'int',
        nullable: true,
    })
    priority: number | null;

    /**
     * Example:
     * APPEARANCE
     * CHARACTERISTICS
     * QUALIFICATIONS
     */
    @Column({
        type: 'varchar',
        length: 255,
    })
    name: string;

    @Column({
        type: 'text',
        nullable: true,
    })
    description: string | null;

    /**
     * 0 = visible
     * 1 = hidden
     */
    @Column({
        type: 'tinyint',
        default: 0,
    })
    hide: number;

    @Column({
        type: 'int',
        nullable: true,
    })
    user_id: number | null;

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

    // @CreateDateColumn({
    //     type: 'datetime',
    //     nullable: true,
    // })
    // created_at: Date | null;

    // @UpdateDateColumn({
    //     type: 'datetime',
    //     nullable: true,
    // })
    // updated_at: Date | null;
    @CreateDateColumn({
        type: 'datetime',
        default: () => 'CURRENT_TIMESTAMP',
    })
    created_at: Date;

    /**
     * Automatically updated whenever the record changes
     */
    @UpdateDateColumn({
        type: 'datetime',
        default: () => 'CURRENT_TIMESTAMP',
        onUpdate: 'CURRENT_TIMESTAMP',
    })
    updated_at: Date;

    @OneToMany(
        () => EvaluationCriteria,
        criteria => criteria.evaluation,
    )
    criterias: EvaluationCriteria[];
}