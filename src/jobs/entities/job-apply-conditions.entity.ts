import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';


import { Jobs } from './job.entity';

@Entity('job_apply_conditions')
export class JobApplyConditions {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({ unsigned: true })
  job_id: number;

  @Column({ unsigned: true })
  apply_condition: number;

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

  @ManyToOne(() => Jobs, (job) => job.applyConditions)
  @JoinColumn({ name: 'job_id' })
  job: Jobs;

  
 
}