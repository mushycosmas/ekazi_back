import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import { Jobs } from 'src/jobs/entities/job.entity';
import { Applicants } from './applicants.entity';
import { Stage } from '../stage.entity';
import { JobStage } from 'src/jobs/entities/job-stage.entity';
import { ApplicantApplication } from './applicant-applicantions.entity';

@Entity('applicant_listings')
export class ApplicantListing {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  stage_id: number;

  @Column()
  job_id: number;

@Column({
    nullable: true,
})
application_id: number | null;

  @Column({
    type: 'int',
    unsigned: true,
  })
  applicant_id: number;

  @Column({
    type: 'int',
    unsigned: true,
  })
  job_stage_id: number;

  @Column()
  status_id: number;

  @Column({
    type: 'tinyint',
    default: 0,
  })
  hide: number;

  @Column({
    length: 100,
    nullable: true,
  })
  status: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Column({
    nullable: true,
  })
  created_by: number;

  @Column({
    nullable: true,
  })
  updated_by: number;

  @ManyToOne(() => Jobs)
  @JoinColumn({ name: 'job_id' })
  job: Jobs;

  @ManyToOne(() => Applicants)
  @JoinColumn({ name: 'applicant_id' })
  applicant: Applicants;

  @ManyToOne(() => Stage)
  @JoinColumn({ name: 'stage_id' })
  stage: Stage;

  @ManyToOne(() => JobStage)
  @JoinColumn({ name: 'job_stage_id' })
  jobStage: JobStage;

  @ManyToOne(() => ApplicantApplication)
  @JoinColumn({ name: 'application_id' })
  application: ApplicantApplication;
}