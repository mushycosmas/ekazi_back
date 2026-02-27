
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
} from 'typeorm';
import { ApplicantEducation } from './applicants/applicant-education.entity';

@Entity('courses')
export class Courses {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({ type: 'int', unsigned: true })
  education_level_id: number;

  @Column({ type: 'int', unsigned: true })
  programme_category_id: number;

  @Column({ type: 'int', unsigned: true, nullable: true })
  updator_id: number | null;

  @Column({ type: 'varchar', length: 100 })
  course_name: string;

  @Column({ type: 'int', unsigned: true })
  creator_id: number;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;

  @Column({ type: 'boolean', default: false })
  hide: boolean;

  // ---------------------
  // Relations
  // ---------------------
  @OneToMany(() => ApplicantEducation, (education) => education.course)
  applicant_education: ApplicantEducation[];
}