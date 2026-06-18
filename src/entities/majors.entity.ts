import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
} from 'typeorm';
import { ApplicantEducation } from './applicants/applicant-education.entity';
import { JobEducation } from 'src/jobs/entities/job-education.entity';
import { JobMajors } from './job-majors.entity';

@Entity('majors')
export class Majors {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'int', unsigned: true, nullable: true })
  creator_id: number | null;

  @Column({ type: 'int', unsigned: true, nullable: true })
  updator_id: number | null;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;

  // ---------------------
  // Relations
  // ---------------------
  @OneToMany(() => ApplicantEducation, (education) => education.major)
  applicant_education: ApplicantEducation[];

  @OneToMany(() => JobEducation, (jobEducation) => jobEducation.major)
  jobEducation: JobEducation[];

  @OneToMany(() => JobMajors, (jobMajor) => jobMajor.major,)
  jobMajors: JobMajors[];
}