import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import { Jobs } from './job.entity';
import { Users } from 'src/entities/users.entity';

@Entity('job_evaluation_specifics')
export class JobEvaluationSpecifics {
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
    (job) => job.evaluationSpecifics,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'job_id' })
  job: Jobs;

  @ManyToOne(() => Users,(user) => user.evaluationSpecifics, )
  @JoinColumn({ name: 'user_id' })
  user: Users;
}