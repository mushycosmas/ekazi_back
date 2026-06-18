import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Jobs } from './job.entity';
import { Users } from 'src/entities/users.entity';

@Entity('job_short_listings')
export class JobShortListings {
  @PrimaryGeneratedColumn({
    unsigned: true,
  })
  id: number;

  @Column({
    name: 'age_from',
    type: 'int',
  })
  ageFrom: number;

  @Column({
    name: 'age_to',
    type: 'int',
  })
  ageTo: number;

  @Column({
    type: 'varchar',
    length: 255,
  })
  gender: string;

  @Column({
    type: 'varchar',
    length: 255,
  })
  skills: string;

  @Column({
    type: 'int',
  })
  education: number;

  @Column({
    type: 'varchar',
    length: 255,
  })
  experience: string;

  @Column({
    name: 'job_id',
    unsigned: true,
  })
  jobId: number;

  @Column({
    name: 'user_id',
    unsigned: true,
  })
  userId: number;

  @ManyToOne(() => Jobs, (job) => job.shortListings, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'job_id',
  })
  job: Jobs;

  @ManyToOne(() => Users, (user) => user.jobShortListings, {
    nullable: false,
  })
  @JoinColumn({
    name: 'user_id',
  })
  user: Users;

  @CreateDateColumn({
    name: 'created_at',
    type: 'datetime',
    nullable: true,
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'datetime',
    nullable: true,
  })
  updatedAt: Date;
}