// import {
//   Entity,
//   PrimaryGeneratedColumn,
//   Column,
//   CreateDateColumn,
//   ManyToOne,
//   JoinColumn,
// } from 'typeorm';

//  ;
// import { Users } from './users.entity';
// import { Task } from 'src/tasks/entities/tasks.entity';

// @Entity('task_attachments')
// export class TaskAttachment {
//   @PrimaryGeneratedColumn({ unsigned: true })
//   id: number;

//   @Column({ type: 'unsigned int' })
//   task_id: number;

//   @Column({ type: 'unsigned int' })
//   uploaded_by: number;

//   @Column({ type: 'varchar', length: 255 })
//   filename: string;

//   @Column({ type: 'varchar', length: 500 })
//   file_path: string;

//     @Column({ type: 'varchar', length: 500 })
//   file_url: string;

//   @CreateDateColumn()
//   created_at: Date;

//   // Task
//   @ManyToOne(() => Task, (task) => task.attachments, {
//     onDelete: 'CASCADE',
//   })
//   @JoinColumn({ name: 'task_id' })
//   task: Task;

//   // User who uploaded the attachment
//   @ManyToOne(() => Users, (user) => user.task_attachments, {
//     onDelete: 'CASCADE',
//   })
//   @JoinColumn({ name: 'uploaded_by' })
//   uploadedBy: Users;
// }