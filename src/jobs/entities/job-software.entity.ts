import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

 
import { Jobs } from './job.entity';
import { Softwares } from 'src/entities/softwares.entity';

@Entity('job_software')
export class JobSoftware {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({ type: 'int', unsigned: true })
  job_id: number;

  @Column({ type: 'int', unsigned: true })
  software_id: number;

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

  @ManyToOne(
    () => Jobs,
    (job) => job.jobSoftwares,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'job_id' })
  job: Jobs;

  @ManyToOne(
    () => Softwares,
    (software) => software.jobSoftwares,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'software_id' })
  software: Softwares;
}