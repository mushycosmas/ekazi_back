import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  Unique,
} from 'typeorm';

@Entity('applicnt_save_jobs')
@Unique('UQ_applicnt_save_jobs_applicant_job', [
  'applicant_id',
  'job_id',
])
@Index('IDX_applicnt_save_jobs_applicant_id', ['applicant_id'])
@Index('IDX_applicnt_save_jobs_job_id', ['job_id'])
export class ApplicantSaveJobs {
  @PrimaryGeneratedColumn('increment', {
    type: 'int',
    unsigned: true,
  })
  id: number;

  @Column({
    type: 'int',
    unsigned: true,
  })
  applicant_id: number;

  @Column({
    type: 'int',
    unsigned: true,
  })
  job_id: number;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  created_at: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  updated_at: Date;
}