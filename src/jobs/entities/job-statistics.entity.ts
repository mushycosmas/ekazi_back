import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';


import { Jobs } from './job.entity';

@Entity('job_statistics')
export class JobStatistics {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  job_id: number;

  @Column()
  job_likes: number;

  @Column()
  job_views: number;

  @Column({
    type: 'boolean',
  })
  apply_condition: boolean;

  @Column({
    length: 400,
    nullable: true,
  })
  external_url: string;

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
    (job) => job.jobStatistics,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'job_id' })
  job: Jobs;
}