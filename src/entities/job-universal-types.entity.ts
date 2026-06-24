import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
} from 'typeorm';


import { JobTypes } from 'src/jobs/entities/job-types.entity';
import { Jobs } from 'src/jobs/entities/job.entity';

@Entity('job_universal_types')
export class JobUniversalTypes {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  type_name: string;

  @Column()
  creator_id: number;

  @Column()
  updator_id: number;

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

  @OneToMany(
    () => JobTypes,
    (jobType) => jobType.jobUniversalType,
  )
  jobTypes: JobTypes[];

  @OneToMany(() => Jobs, (job) => job.jobUniversalType)
  jobs: Jobs[];
}