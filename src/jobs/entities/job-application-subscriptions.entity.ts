import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import { Jobs } from './job.entity';

@Entity('job_application_subscriptions')
export class JobApplicationSubscriptions {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  subscribe: number;

  @Column({ type: 'int' })
  cv: number;

  @Column({ type: 'int' })
  cover_letter: number;

  @Column({ type: 'int' })
  certificate: number;

  @Column({ type: 'int', nullable: true })
  job_id: number | null;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  created_at: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  updated_at: Date;

  // ======================
  // Relations
  // ======================

  @ManyToOne(
    () => Jobs,
    (job) => job.applicationSubscriptions,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'job_id' })
  job: Jobs;
}