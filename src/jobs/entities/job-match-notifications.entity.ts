import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import { Jobs } from './job.entity';
import { Applicants } from 'src/entities/applicants/applicants.entity';

@Entity('job_match_notifications')
export class JobMatchNotifications {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  job_id: number;

  @Column()
  applicant_id: number;

  @Column()
  match_percentage: number;

  @Column()
  required: number;

  @Column()
  total_match: number;

  @Column({ length: 100 })
  match_status: string;

  @Column()
  creator_id: number;

  @Column()
  updator_id: number;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  updated_at: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  created_at: Date;

  // ======================
  // Relations
  // ======================

  @ManyToOne(
    () => Jobs,
    (job) => job.matchNotifications,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'job_id' })
  job: Jobs;

  @ManyToOne(
    () => Applicants,
    (applicant) => applicant.matchNotifications,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'applicant_id' })
  applicant: Applicants;
}