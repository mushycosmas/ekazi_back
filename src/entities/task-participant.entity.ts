// import {
//   Entity,
//   PrimaryGeneratedColumn,
//   Column,
//   CreateDateColumn,
//   ManyToOne,
//   JoinColumn,
//   Unique,
// } from 'typeorm';

 
// import { Users } from './users.entity';
// import { Task } from 'src/tasks/entities/tasks.entity';

// @Entity('task_participants')
// @Unique(['task_id', 'user_id'])
// export class TaskParticipant {
//   @PrimaryGeneratedColumn({ unsigned: true })
//   id: number;

//   @Column({ type: 'unsigned int' })
//   task_id: number;

//   @Column({ type: 'unsigned int' })
//   user_id: number;

//   @Column({
//     type: 'enum',
//     enum: ['assignee', 'reviewer', 'observer'],
//     default: 'assignee',
//   })
//   role: string;

//   @Column({ type: 'unsigned int', nullable: true })
//   assigned_by: number;

//   @CreateDateColumn()
//   assigned_at: Date;

//   // Task
//   @ManyToOne(() => Task, (task) => task.participants, {
//     onDelete: 'CASCADE',
//   })
//   @JoinColumn({ name: 'task_id' })
//   task: Task;

//   // Assigned user
//   @ManyToOne(() => Users, (user) => user.task_participations, {
//     onDelete: 'CASCADE',
//   })
//   @JoinColumn({ name: 'user_id' })
//   user: Users;

//   // User who assigned this participant
//   @ManyToOne(() => Users, {
//     nullable: true,
//     onDelete: 'SET NULL',
//   })
//   @JoinColumn({ name: 'assigned_by' })
//   assignedByUser: Users;
// }