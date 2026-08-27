import {
    Column,
    CreateDateColumn,
    Entity,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { TermCondition } from './term-condition.entity';

@Entity('term_condition_types')
export class TermConditionType {
    @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
    id: number;

    @Column({
        type: 'varchar',
        length: 100,
    })
    type: string;

    @CreateDateColumn({
        name: 'created_at',
        type: 'timestamp',
        default: () => 'CURRENT_TIMESTAMP',
    })
    created_at: Date;

    @UpdateDateColumn({
        name: 'updated_at',
        type: 'timestamp',
        default: () => 'CURRENT_TIMESTAMP',
        onUpdate: 'CURRENT_TIMESTAMP',
    })
    updated_at: Date;

    @Column({
        type: 'tinyint',
        width: 1,
        default: 0,
    })
    hide: number;

    @Column({
        name: 'deleted_at',
        type: 'datetime',
        nullable: true,
    })
    deleted_at: Date | null;

    @OneToMany(
        () => TermCondition,
        (termCondition) => termCondition.type,
    )
    termConditions: TermCondition[];
}