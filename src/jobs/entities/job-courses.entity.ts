import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import { Jobs } from './job.entity';
import { Courses } from 'src/entities/courses.entity';

@Entity('job_courses')
export class JobCourses {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({
    type: 'int',
    unsigned: true,
    nullable: true,
  })
  course_id: number | null;

  @Column()
  job_id: number;

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

  @ManyToOne(
    () => Jobs,
    (job) => job.jobCourses,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'job_id' })
  job: Jobs;

  @ManyToOne(
    () => Courses,
    (course) => course.jobCourses,
    {
      nullable: true,
    },
  )
  @JoinColumn({ name: 'course_id' })
  course: Courses;
}