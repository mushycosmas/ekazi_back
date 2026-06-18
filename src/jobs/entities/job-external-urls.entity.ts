import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import { Jobs } from './job.entity';

@Entity('job_external_url')
export class JobExternalUrls {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({
    type: 'int',
    unsigned: true,
  })
  job_id: number;

  @Column({
    type: 'varchar',
    length: 2100,
    nullable: true,
  })
  external_url: string | null;

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
    (job) => job.externalUrls,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'job_id' })
  job: Jobs;
}