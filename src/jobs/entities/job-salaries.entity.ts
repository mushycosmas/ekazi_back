import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import { Jobs } from './job.entity';
import { SalaryRanges } from 'src/entities/salary-ranges.entity';

@Entity('job_salaries')
export class JobSalaries {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  job_id: number;

  @Column({ type: 'int', nullable: true })
  from_salary: number;

  @Column({ type: 'int', nullable: true })
  to_salary: number;

  @Column({ type: 'int', nullable: true })
  creator_id: number;

  @Column({ type: 'int', nullable: true })
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

  // Job Relation
  @ManyToOne(() => Jobs, (job) => job.jobSalaries, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'job_id' })
  job: Jobs;

    @ManyToOne(() => SalaryRanges, { eager: false })
  @JoinColumn({ name: 'from_salary' })
  fromSalary: SalaryRanges;

  @ManyToOne(() => SalaryRanges, { eager: false })
  @JoinColumn({ name: 'to_salary' })
  toSalary: SalaryRanges;
}