// src/entities/applicants/education-levels.entity.ts
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
} from 'typeorm';
import { ApplicantEducation } from './applicants/applicant-education.entity';
import { JobEducation } from 'src/jobs/entities/job-education.entity';

@Entity('education_levels')
export class EducationLevels {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({ type: 'int', unsigned: true })
  industry_id: number;

  @Column({ type: 'varchar', length: 100 })
  education_level: string;

  @Column({ type: 'boolean', default: false })
  hide: boolean;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;

  // ---------------------
  // Relations
  // ---------------------
  @OneToMany(() => ApplicantEducation, (education) => education.education_level)
  applicant_education: ApplicantEducation[];

  @OneToMany(() => JobEducation, (jobEducation) => jobEducation.educationLevel)
  jobEducation: JobEducation[];
}