
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
} from 'typeorm';

import { ApplicantEducation } from './applicants/applicant-education.entity';

@Entity('colleges')
export class Colleges {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({ type: 'int', unsigned: true })
  region_id: number;

  @Column({ type: 'varchar', length: 100 })
  town: string;

  @Column({ type: 'varchar', length: 45 })
  reg: string;

  @Column({ type: 'varchar', length: 100 })
  college_name: string;

  @Column({ type: 'varchar', length: 256 })
  status: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;

  @Column({ type: 'int', nullable: true, unsigned: true })
  creator_id: number | null;

  @Column({ type: 'int', nullable: true, unsigned: true })
  updator_id: number | null;

  @Column({ type: 'boolean', default: false })
  hide: boolean;

  // ----------------------
  // Reverse relations
  // ----------------------


  @OneToMany(
    () => ApplicantEducation,
    (applicantEducation) => applicantEducation.college,
  )
  applicant_education: ApplicantEducation[];
}