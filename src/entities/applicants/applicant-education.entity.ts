// src/entities/applicants/applicant-education.entity.ts
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Applicants } from './applicants.entity';

import { Colleges } from '../colleges.entity';

import { Courses } from '../courses.entity';

import { Majors } from '../majors.entity';

import { EducationLevels } from '../education-levels.entity';

@Entity('applicant_education')
export class ApplicantEducation {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({ type: 'int', unsigned: true, nullable: true })
  college_id: number | null;

  @Column({ type: 'int', unsigned: true })
  course_id: number;

  @Column({ type: 'int', unsigned: true })
  major_id: number;

  @Column({ type: 'int', unsigned: true })
  education_level_id: number;

  @Column({ type: 'varchar', length: 200, nullable: true })
  name: string | null;

  @Column({ type: 'int', unsigned: true })
  applicant_id: number;

  @Column({ type: 'text', nullable: true })
  attachment: string | null;

  @Column({ type: 'datetime', nullable: true, default: () => 'CURRENT_TIMESTAMP' })
  started: Date | null;

  @Column({ type: 'datetime', nullable: true, default: () => 'CURRENT_TIMESTAMP' })
  ended: Date | null;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;

  // ---------------------
  // Relations
  // ---------------------
  @ManyToOne(() => Applicants, (applicant) => applicant.applicant_education)
  @JoinColumn({ name: 'applicant_id' })
  applicant: Applicants;

  @ManyToOne(() => Colleges, (college) => college.applicant_education, { nullable: true })
  @JoinColumn({ name: 'college_id' })
  college: Colleges | null;

  @ManyToOne(() => Courses, (course) => course.applicant_education)
  @JoinColumn({ name: 'course_id' })
  course: Courses;

  @ManyToOne(() => Majors, (major) => major.applicant_education)
  @JoinColumn({ name: 'major_id' })
  major: Majors;

  @ManyToOne(() => EducationLevels, (level) => level.applicant_education)
  @JoinColumn({ name: 'education_level_id' })
  education_level: EducationLevels;
}