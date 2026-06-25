// src/entities/applicants/positions.entity.ts
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
} from 'typeorm';
import { ApplicantPositions } from './applicants/applicant-positions.entity';
import { Jobs } from 'src/jobs/entities/job.entity';
import { JobPositions } from 'src/jobs/entities/job-positions.entity';

@Entity('positions')
export class Positions {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({ type: 'int' })
  creator_id: number;

  @Column({ type: 'int' })
  updator_id: number;

  @Column({ type: 'int', unsigned: true, nullable: true })
  industry_id: number | null;

  @Column({ type: 'varchar', length: 100 ,unique: true})
  position_name: string | null;

  @Column({ type: 'text' })
  slug: string;

  @Column({ type: 'int' })
  hide: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  deleted_at: Date | null;

  // ---------------------
  // Reverse relation: positions -> applicant_positions
  // ---------------------
  @OneToMany(() => ApplicantPositions, (ap) => ap.position)
  applicant_positions: ApplicantPositions[];

  @OneToMany(() => Jobs, (job) => job.position)
  jobs: Jobs[];

  @OneToMany(() => JobPositions, (jobPosition) => jobPosition.position,)
  jobPositions: JobPositions[];
}