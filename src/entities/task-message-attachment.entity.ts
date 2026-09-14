//  import {
//   Entity,
//   PrimaryGeneratedColumn,
//   Column,
//   CreateDateColumn,
//   ManyToOne,
//   JoinColumn,
// } from 'typeorm';

// import { TaskMessage } from './task-message.entity';
// import { Users } from './users.entity';

// @Entity('task_message_attachments')
// export class TaskMessageAttachment {
//   @PrimaryGeneratedColumn({ unsigned: true })
//   id: number;

//   @Column({ type: 'unsigned int' })
//   message_id: number;

//   @Column({ type: 'unsigned int' })
//   uploaded_by: number;

//   @Column({ type: 'varchar', length: 255 })
//   file_name: string;

//   @Column({ type: 'varchar', length: 500 })
//   file_path: string;

//   @Column({ type: 'varchar', length: 100, nullable: true })
//   file_type: string;

//   @Column({ type: 'bigint', unsigned: true, nullable: true })
//   file_size: number;

//   @CreateDateColumn()
//   created_at: Date;

//   // Message
//   @ManyToOne(
//     () => TaskMessage,
//     (message) => message.attachments,
//     {
//       onDelete: 'CASCADE',
//     },
//   )
//   @JoinColumn({ name: 'message_id' })
//   message: TaskMessage;

//   // User who uploaded
//   @ManyToOne(() => Users, {
//     onDelete: 'CASCADE',
//   })
//   @JoinColumn({ name: 'uploaded_by' })
//   uploadedBy: Users;
// }