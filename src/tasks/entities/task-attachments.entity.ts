import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';


import { Task } from './tasks.entity';

@Entity('task_attachments')
export class TaskAttachment {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        type: 'int',
    })
    task_id: number;

    @Column({
        type: 'text',
    })
    file_path: string;

    @Column({
        type: 'text',
    })
    filename: string;

    @Column({
        type: 'text',
    })
    file_url: string;

    @CreateDateColumn({
        type: 'timestamp',
    })
    created_at: Date;

    @UpdateDateColumn({
        type: 'timestamp',
    })
    updated_at: Date;

    // ============================
    // Relations
    // ============================

    @ManyToOne(
        () => Task,
        task => task.attachments,
        {
            onDelete: 'CASCADE',
        },
    )
    @JoinColumn({
        name: 'task_id',
    })
    task: Task;
}