import {
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';

@Entity('evaluation_scores')
export class EvaluationScore {

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
        type: 'varchar',
        length: 100,
    })
    label: string;

    @Column({
        type: 'decimal',
        precision: 10,
        scale: 2,
    })
    score: number;

    @Column({
        type: 'int',
        default: 0,
    })
    priority: number;

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
}