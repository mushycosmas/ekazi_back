import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';

import { Correspondence } from './correspondence.entity';
import { CorrespondenceParticipant } from './correspondence-participant.entity';

@Entity('correspondence_threads')
export class CorrespondenceThread {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
  id: number;

  @Column({ type: 'int', nullable: true })
  created_by: number | null;

  // Legacy fields - keep for backward compatibility
  @Column({ type: 'int', unsigned: true, nullable: true })
  applicant_id: number | null;

  @Column({ type: 'int', unsigned: true, nullable: true })
  employer_id: number | null;

  @Column({ type: 'bigint', unsigned: true, nullable: true })
  job_id: number | null;

  @Column({ type: 'varchar', length: 255 })
  subject: string;

  @Column({ type: 'datetime', nullable: true })
  last_message_at: Date | null;

  @Column({
    type: 'enum',
    enum: ['applicant', 'employer', 'system', 'admin'],
    nullable: true,
  })
  last_sender_type:
    | 'applicant'
    | 'employer'
    | 'system'
    | 'admin'
    | null;

  @Column({ type: 'int', nullable: true })
  last_sender_id: number | null;

  // Legacy unread count
  @Column({ type: 'int', default: 0, nullable: true })
  applicant_unread_count: number;

  @Column({ type: 'int', default: 0, nullable: true })
  employer_unread_count: number;

  @Column({ type: 'tinyint', default: 1 })
  visible_to_applicant: boolean;

  @Column({
    type: 'enum',
    enum: ['open', 'closed'],
    default: 'open',
    nullable: true,
  })
  status: 'open' | 'closed';

  @CreateDateColumn({ type: 'timestamp', nullable: true })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp', nullable: true })
  updated_at: Date;

  @OneToMany(
    () => Correspondence,
    (correspondence) => correspondence.thread,
  )
  messages: Correspondence[];

  @OneToMany(
    () => CorrespondenceParticipant,
    (participant) => participant.thread,
  )
  participants: CorrespondenceParticipant[];
}