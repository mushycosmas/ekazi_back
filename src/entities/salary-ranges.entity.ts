import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
} from 'typeorm';
import { ApplicantPositions } from './applicants/applicant-positions.entity';
import { JobSalaries } from 'src/jobs/entities/job-salaries.entity';

@Entity('salary_ranges')
export class SalaryRanges {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  low: number;

  @Column({ type: 'int' })
  high: number;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  // ---------------------
  // Reverse relations
  // ---------------------
  //   @OneToMany(() => ApplicantPositions, (ap) => ap.current_salary, { cascade: true })
  //   current_positions: ApplicantPositions[];

  @OneToMany(() => ApplicantPositions, (ap) => ap.start_salary, { cascade: true })
  start_positions: ApplicantPositions[];

  @OneToMany(() => ApplicantPositions, (ap) => ap.end_salary, { cascade: true })
  end_positions: ApplicantPositions[];

  @OneToMany(() => JobSalaries, (jobSalary) => jobSalary.fromSalary)
  jobFromSalaries: JobSalaries[];

  @OneToMany(() => JobSalaries, (jobSalary) => jobSalary.toSalary)
  jobToSalaries: JobSalaries[];
}