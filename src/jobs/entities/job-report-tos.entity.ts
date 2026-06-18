 import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';


import { Jobs } from './job.entity';

@Entity('job_report_tos')
export class JobReportTos {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({ type: 'int', unsigned: true })
  job_id: number;

  @Column({ type: 'varchar', length: 450, nullable: true })
  supervises: string;

  @Column({ type: 'varchar', length: 300, nullable: true })
  interacts_with: string;

  @Column({ type: 'varchar', length: 700, nullable: true })
  report_to: string;

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

  // Relationship with Jobs
  @ManyToOne(() => Jobs, (job) => job.jobReportTos, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'job_id' })
  job: Jobs;
}