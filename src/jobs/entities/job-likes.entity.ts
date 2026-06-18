import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import { Users } from 'src/entities/users.entity';
import { Jobs } from './job.entity';

@Entity('job_likes')
export class JobLikes {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'int',
    unsigned: true,
    nullable: true,
  })
  user_id: number;

  @Column({
    type: 'int',
    unsigned: true,
    nullable: true,
  })
  job_id: number;

  @Column({
    type: 'timestamp',
    nullable: true,
  })
  created_at: Date;

  @Column({
    type: 'timestamp',
    nullable: true,
  })
  updated_at: Date;

  // ======================
  // Relations
  // ======================

  @ManyToOne(() => Users, (user) => user.jobLikes, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: Users;

  @ManyToOne(() => Jobs, (job) => job.jobLikes, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'job_id' })
  job: Jobs;
}