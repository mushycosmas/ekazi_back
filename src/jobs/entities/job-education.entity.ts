import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import { Jobs } from './job.entity';
import { Courses } from 'src/entities/courses.entity';
import { EducationLevels } from 'src/entities/education-levels.entity';
import { Majors } from 'src/entities/majors.entity';
 

@Entity('job_education')
export class JobEducation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unsigned: true })
  programme_category_id: number;

  @Column()
  course_id: number;

  @Column({ unsigned: true })
  education_level_id: number;

  @Column()
  major_id: number;

  @Column({ unsigned: true })
  job_id: number;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  created_at: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    nullable: true,
  })
  updated_at: Date | null;

  // ======================
  // Relations
  // ======================

  @ManyToOne(() => Jobs, (job) => job.jobEducation)
  @JoinColumn({ name: 'job_id' })
  job: Jobs;

  @ManyToOne(() => Courses, (course) => course.jobEducation)
  @JoinColumn({ name: 'course_id' })
  course: Courses;

  @ManyToOne(() => EducationLevels, (educationLevel) => educationLevel.jobEducation)
  @JoinColumn({ name: 'education_level_id' })
  educationLevel: EducationLevels;

  @ManyToOne(() => Majors, (major) => major.jobEducation)
  @JoinColumn({ name: 'major_id' })
  major: Majors;

 
}