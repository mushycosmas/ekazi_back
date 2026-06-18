import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import { Jobs } from './job.entity';

@Entity('job_application_modals')
export class JobApplicationModals {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  job_id: number;

  @Column({
    type: 'text',
    nullable: true,
  })
  status: string | null;

  @Column({
    type: 'varchar',
    length: 200,
  })
  message: string;

  @Column({
    type: 'timestamp',
  })
  created_at: Date;

  @Column({
    type: 'timestamp',
  })
  updated_at: Date;

  // ======================
  // Relations
  // ======================

  @ManyToOne(
    () => Jobs,
    (job) => job.applicationModals,
  )
  @JoinColumn({ name: 'job_id' })
  job: Jobs;
}