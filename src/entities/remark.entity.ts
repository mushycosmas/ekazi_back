 import {
    Column,
    CreateDateColumn,
    Entity,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { EvaluationRemark } from './evaluation-remark.entity';

@Entity('remarks')
export class Remark {
    @PrimaryGeneratedColumn({
        type: 'int',
        unsigned: true,
    })
    id: number;

    @Column({
        type: 'decimal',
        precision: 10,
        scale: 2,
    })
    score: number;

    @Column({
        type: 'varchar',
        length: 50,
    })
    remark: string;

    @Column({
        type: 'tinyint',
        width: 1,
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

    @OneToMany(
        () => EvaluationRemark,
        evaluationRemark => evaluationRemark.remark,
    )
    evaluation_remarks: EvaluationRemark[];
}