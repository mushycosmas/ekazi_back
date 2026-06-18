import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import { Jobs } from 'src/jobs/entities/job.entity';
import { Majors } from './majors.entity';

@Entity('job_majors')
export class JobMajors {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  job_id: number;

  @Column()
  major_id: number;

  @Column({ nullable: true })
  creator_id: number;

  @Column({ nullable: true })
  updator_id: number;

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
    (job) => job.jobMajors,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'job_id' })
  job: Jobs;

  @ManyToOne(
    () => Majors,
    (major) => major.jobMajors,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'major_id' })
  major: Majors;
}