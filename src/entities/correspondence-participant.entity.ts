import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';

import { CorrespondenceThread } from './correspondence-thread.entity';

@Entity('correspondence_participants')
@Index(['thread_id', 'user_id'], { unique: true })
export class CorrespondenceParticipant {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
  id: number;

  @Column({ type: 'int', unsigned: true })
  thread_id: number;

  @Column({ type: 'int' })
  user_id: number;

  @Column({
    type: 'enum',
    enum: ['admin', 'employer', 'applicant', 'system'],
  })
  participant_type: 'admin' | 'employer' | 'applicant' | 'system';

  @Column({ type: 'tinyint', default: 1 })
  is_active: boolean;

  @Column({ type: 'int', unsigned: true, nullable: true })
  last_read_message_id: number | null;

  @CreateDateColumn({ type: 'timestamp', nullable: true })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp', nullable: true })
  updated_at: Date;

  @ManyToOne(
    () => CorrespondenceThread,
    (thread) => thread.participants,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'thread_id' })
  thread: CorrespondenceThread;
}