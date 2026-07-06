import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
    OneToMany,
} from 'typeorm';

import { Users } from 'src/entities/users.entity';
import { TaskAssignment } from './task-assignments.entity';

export enum TaskPriority {
    LOW = 'Low',
    MEDIUM = 'Medium',
    HIGH = 'High',
}

export enum TaskStatus {
    PENDING = 'Pending',
    IN_PROGRESS = 'InProgress',
    COMPLETED = 'Completed',
}

@Entity('tasks')
export class Task {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        type: 'varchar',
        length: 255,
    })
    title: string;

    @Column({
        type: 'text',
        nullable: true,
    })
    description: string;

    @Column({
        type: 'date',
        nullable: true,
    })
    deadline: Date;

    @Column({
        type: 'enum',
        enum: TaskPriority,
        default: TaskPriority.MEDIUM,
    })
    priority: TaskPriority;

    @Column({
        type: 'enum',
        enum: TaskStatus,
        default: TaskStatus.PENDING,
    })
    status: TaskStatus;

    @Column()
    created_by: number;

    @ManyToOne(() => Users, (user) => user.tasks)
    @JoinColumn({ name: 'created_by' })
    creator: Users;

    @CreateDateColumn({
        type: 'timestamp',
    })
    created_at: Date;

    @UpdateDateColumn({
        type: 'timestamp',
    })
    updated_at: Date;

    @OneToMany(() => TaskAssignment, (a) => a.task)
    assignments: TaskAssignment[];
}