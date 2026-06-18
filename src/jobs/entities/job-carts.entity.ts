import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import { Jobs } from './job.entity';
import { Applicants } from 'src/entities/applicants/applicants.entity';

@Entity('job_carts')
export class JobCarts {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  applicant_id: number;

  @Column()
  job_id: number;

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

  @ManyToOne(() => Applicants, (applicant) => applicant.jobCarts)
  @JoinColumn({ name: 'applicant_id' })
  applicant: Applicants;

  @ManyToOne(() => Jobs, (job) => job.jobCarts)
  @JoinColumn({ name: 'job_id' })
  job: Jobs;
}