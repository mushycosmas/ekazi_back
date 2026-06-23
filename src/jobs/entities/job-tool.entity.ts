import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import { Jobs } from './job.entity';
import { Tools } from 'src/entities/tools.entity';

@Entity('job_tools')
export class JobTool {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column()
  job_id: number;

  @Column()
  tool_id: number;

  @Column()
  user_id: number;

  @Column({
    default: 0,
  })
  hide: number;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  created_at: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updated_at: Date;

  // ======================
  // Relations
  // ======================

  @ManyToOne(
    () => Jobs,
    (job) => job.jobTools,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'job_id' })
  job: Jobs;

  @ManyToOne(
    () => Tools,
    (tool) => tool.jobTools,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'tool_id' })
  tool: Tools;
}