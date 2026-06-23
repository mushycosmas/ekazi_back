import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';


import { Jobs } from './job.entity';
import { JobUniversalTypes } from 'src/entities/job-universal-types.entity';
@Entity('job_types')
export class JobTypes {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  job_universal_type_id: number;

  @Column()
  job_id: number;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  created_at: Date;

  @Column({
    type: 'timestamp',
    nullable: true,
    default: () => 'CURRENT_TIMESTAMP',
  })
  updated_at: Date;

  // ======================
  // Relations
  // ======================

  @ManyToOne(
    () => Jobs,
    (job) => job.jobTypes,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'job_id' })
  job: Jobs;

  @ManyToOne(
    () => JobUniversalTypes,
    (jobUniversalType) => jobUniversalType.jobTypes,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'job_universal_type_id' })
  jobUniversalType: JobUniversalTypes;
}