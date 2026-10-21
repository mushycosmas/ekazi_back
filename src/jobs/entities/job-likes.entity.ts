
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

import { Users } from 'src/entities/users.entity';
import { Jobs } from './job.entity';

@Entity('job_likes')
@Index('IDX_job_likes_user_id', ['user_id'])
@Index('IDX_job_likes_job_id', ['job_id'])
export class JobLikes {
  @PrimaryGeneratedColumn({
    type: 'int',
  })
  id: number;

  @Column({
    type: 'int',
    unsigned: true,
    nullable: true,
  })
  user_id: number | null;

  @Column({
    type: 'int',
    unsigned: true,
    nullable: true,
  })
  job_id: number | null;

  @CreateDateColumn({
    type: 'timestamp',
    nullable: true,
  })
  created_at: Date | null;

  @UpdateDateColumn({
    type: 'timestamp',
    nullable: true,
  })
  updated_at: Date | null;

  // Relations
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