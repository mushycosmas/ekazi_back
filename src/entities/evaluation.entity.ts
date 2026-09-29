import {
    Column,
    CreateDateColumn,
    Entity,
    OneToMany,
    ManyToOne,
    JoinColumn,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';

import { EvaluationRemark } from './evaluation-remark.entity';
import { EvaluationCriteria } from './evaluation-criteria.entity';
@Entity('evaluations')
export class Evaluation {
    @PrimaryGeneratedColumn({
        type: 'int',
        unsigned: true,
    })
    id: number;

    @Column({
        type: 'varchar',
        length: 255,
    })
    group: string;

    @Column({
        type: 'int',
        nullable: true,
    })
    priority: number | null;

    @Column({
        type: 'varchar',
        length: 255,
    })
    name: string;

    @Column({
        type: 'text',
    })
    description: string;

    @Column({
        type: 'int',
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

    /*
     * If evaluations has a form_id column in your actual database,
     * add the relationship below.
     *
     * Currently the structure you provided does NOT show form_id.
     */

    @OneToMany(
        () => EvaluationCriteria,
        criteria => criteria.evaluation,
    )
    criterias: EvaluationCriteria[];

    @OneToMany(
        () => EvaluationRemark,
        remark => remark.evaluation,
    )
    evaluation_remarks: EvaluationRemark[];
}