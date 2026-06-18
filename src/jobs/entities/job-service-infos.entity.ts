import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

 
import { Jobs } from './job.entity';
import { Users } from 'src/entities/users.entity';

@Entity('job_service_infos')
export class JobServiceInfos {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  type: string;

  @Column({ type: 'varchar', length: 255 })
  info: string;

  @Column({ type: 'int', unsigned: true })
  job_id: number;

  @Column({ type: 'int', unsigned: true })
  user_id: number;

  @Column({ type: 'datetime', nullable: true })
  created_at: Date;

  @Column({ type: 'datetime', nullable: true })
  updated_at: Date;

  // Job Relationship
  @ManyToOne(() => Jobs, (job) => job.jobServiceInfos, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'job_id' })
  job: Jobs;

  // User Relationship
  @ManyToOne(() => Users, (user) => user.jobServiceInfos, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: Users;
}