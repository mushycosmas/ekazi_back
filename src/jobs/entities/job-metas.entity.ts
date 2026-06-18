import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import { MetaKeywords } from 'src/entities/meta-keywords.entity';
import { Jobs } from './job.entity';

@Entity('job_metas')
export class JobMetas {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  creator_id: number;

  @Column({ nullable: true })
  updator_id: number;

  @Column()
  job_id: number;

  @Column()
  meta_keyword_id: number;

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
    (job) => job.jobMetas,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'job_id' })
  job: Jobs;

  @ManyToOne(
    () => MetaKeywords,
    (metaKeyword) => metaKeyword.jobMetas,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'meta_keyword_id' })
  metaKeyword: MetaKeywords;
}