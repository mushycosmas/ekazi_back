// import {
//   Entity,
//   PrimaryGeneratedColumn,
//   Column,
//   CreateDateColumn,
//   UpdateDateColumn,
//   ManyToOne,
//   OneToMany,
//   JoinColumn,
// } from 'typeorm';

 
 
// import { Task } from 'src/tasks/entities/tasks.entity';
// import { Users } from './users.entity';
// import { TaskMessageAttachment } from './task-message-attachment.entity';

// @Entity('task_messages')
// export class TaskMessage {
//   @PrimaryGeneratedColumn({ unsigned: true })
//   id: number;

//   @Column({ type: 'unsigned int' })
//   task_id: number;

//   @Column({ type: 'unsigned int' })
//   user_id: number;

//   @Column({ type: 'unsigned int', nullable: true })
//   parent_id: number;

//   @Column({ type: 'text' })
//   message: string;

//   @CreateDateColumn()
//   created_at: Date;

//   @UpdateDateColumn()
//   updated_at: Date;

//   // Task
//   @ManyToOne(() => Task, (task) => task.messages, {
//     onDelete: 'CASCADE',
//   })
//   @JoinColumn({ name: 'task_id' })
//   task: Task;

//   // Sender
//   @ManyToOne(() => Users, (user) => user.task_messages, {
//     onDelete: 'CASCADE',
//   })
//   @JoinColumn({ name: 'user_id' })
//   sender: Users;

//   // Parent message - for replies
//   @ManyToOne(() => TaskMessage, (message) => message.replies, {
//     nullable: true,
//     onDelete: 'CASCADE',
//   })
//   @JoinColumn({ name: 'parent_id' })
//   parent: TaskMessage;

//   // Replies
//   @OneToMany(
//     () => TaskMessage,
//     (message) => message.parent,
//   )
//   replies: TaskMessage[];

//   // Files attached to this message
//   @OneToMany(
//     () => TaskMessageAttachment,
//     (attachment) => attachment.message,
//   )
//   attachments: TaskMessageAttachment[];
// }