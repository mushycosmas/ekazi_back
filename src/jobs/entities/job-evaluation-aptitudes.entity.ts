import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import { Jobs } from './job.entity';
import { Users } from 'src/entities/users.entity';

@Entity('job_evaluation_aptitudes')
export class JobEvaluationAptitudes {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({
    type: 'varchar',
    length: 255,
  })
  name: string;

  @Column({
    type: 'int',
    unsigned: true,
  })
  user_id: number;

  @Column({
    type: 'boolean',
  })
  hide: boolean;

  @Column({
    type: 'int',
    unsigned: true,
  })
  job_id: number;

  @Column({
    type: 'datetime',
    nullable: true,
  })
  created_at: Date | null;

  @Column({
    type: 'datetime',
    nullable: true,
  })
  updated_at: Date | null;

  // ======================
  // Relations
  // ======================

  @ManyToOne(
    () => Jobs,
    (job) => job.evaluationAptitudes,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'job_id' })
  job: Jobs;

  @ManyToOne(
    () => Users,
    (user) => user.evaluationAptitudes,
  )
  @JoinColumn({ name: 'user_id' })
  user: Users;
}