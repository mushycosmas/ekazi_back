 import {
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';

import { Evaluation } from './evaluation.entity';
import { Remark } from './remark.entity';

@Entity('evaluation_remarks')
export class EvaluationRemark {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        type: 'int',
    })
    evaluation_id: number;

    @Column({
        type: 'int',
    })
    remark_id: number;

    @Column({
        type: 'decimal',
        precision: 10,
        scale: 2,
        nullable: true,
    })
    score: number;

    @ManyToOne(
        () => Evaluation,
        evaluation => evaluation.evaluation_remarks,
        {
            onDelete: 'CASCADE',
        },
    )
    @JoinColumn({
        name: 'evaluation_id',
    })
    evaluation: Evaluation;

    @ManyToOne(
        () => Remark,
        remark => remark.evaluation_remarks,
        {
            onDelete: 'CASCADE',
        },
    )
    @JoinColumn({
        name: 'remark_id',
    })
    remark: Remark;
}