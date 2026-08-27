import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';

 
import { TermConditionType } from './term-condition-type.entity';

@Entity('term_and_conditions')
export class TermCondition {
    @PrimaryGeneratedColumn({
        type: 'int',
    })
    id: number;

    @Column({
        type: 'int',
        unsigned: true,
    })
    creator_id: number;

    @Column({
        type: 'int',
        unsigned: true,
    })
    type_id: number;

    @Column({
        type: 'text',
    })
    title: string;

    @Column({
        type: 'text',
    })
    body: string;

    @Column({
        type: 'tinyint',
        width: 1,
        default: 0,
    })
    hide: number;

    @CreateDateColumn({
        name: 'created_at',
        type: 'timestamp',
    })
    created_at: Date;

    @UpdateDateColumn({
        name: 'updated_at',
        type: 'timestamp',
    })
    updated_at: Date;

    @Column({
        name: 'deleted_at',
        type: 'timestamp',
        nullable: true,
    })
    deleted_at: Date | null;

    /**
     * Relation with TermConditionType
     */
    @ManyToOne(
        () => TermConditionType,
        (termConditionType) =>
            termConditionType.termConditions,
    )
    @JoinColumn({
        name: 'type_id',
        referencedColumnName: 'id',
    })
    type: TermConditionType;
}