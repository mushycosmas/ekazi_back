// src/entities/applicants/applicant-positions.entity.ts
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Applicants } from './applicants.entity';
import { Positions } from '../positions.entity';

import { PositionLevels } from '../position-levels.entity';

import { Industries } from '../industries.entity';

import { SalaryRanges } from '../salary-ranges.entity';

import { Regions } from '../regions.entity';
import { ApplicantEmployers } from './applicant-employers.entity';

@Entity('applicant_positions')
export class ApplicantPositions {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({ type: 'int', unsigned: true })
  applicant_id: number;

  @Column({ type: 'int', unsigned: true })
  industry_id: number;

  @Column({ type: 'int', unsigned: true })
  applicant_employer_id: number;

  @Column({ type: 'int', unsigned: true })
  position_id: number;

  @Column({ type: 'int' })
  position_level_id: number;

  @Column({ type: 'int', unsigned: true, nullable: true })
  salary_id: number | null;

  @Column({ type: 'varchar', length: 100 })
  responsibility: string;

  @Column({ type: 'varchar', length: 200 })
  remark: string;

  @Column({ type: 'int' })
  start_salary_id: number;

  @Column({ type: 'int' })
  end_salary_id: number;

  @Column({ type: 'datetime' })
  start_date: Date;

  @Column({ type: 'datetime', nullable: true })
  end_date: Date | null;

  @Column({ type: 'int', nullable: true })
  region_id: number | null;

  @Column({ type: 'text', nullable: true })
  sub_location: string | null;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;

  // ---------------------
  // Relations
  // ---------------------
//   @ManyToOne(() => SalaryRanges, (s) => s.current_applicant_positions, { nullable: true })
//   @JoinColumn({ name: 'salary_id' })
//   current_salary: SalaryRanges | null;

  @ManyToOne(() => SalaryRanges, (s) => s.low)
  @JoinColumn({ name: 'start_salary_id' })
  start_salary: SalaryRanges;

  @ManyToOne(() => SalaryRanges, (s) => s.high)
  @JoinColumn({ name: 'end_salary_id' })
  end_salary: SalaryRanges;

  @ManyToOne(() => Applicants, (a) => a.positions)
  @JoinColumn({ name: 'applicant_id' })
  applicant: Applicants;

  @ManyToOne(() => Positions, (p) => p.applicant_positions)
  @JoinColumn({ name: 'position_id' })
  position: Positions;

  @ManyToOne(() => PositionLevels, (pl) => pl.applicant_positions)
  @JoinColumn({ name: 'position_level_id' })
  position_level: PositionLevels;

  @ManyToOne(() => Industries, (i) => i.applicant_positions)
  @JoinColumn({ name: 'industry_id' })
  industry: Industries;

  @ManyToOne(() => Regions, (r) => r.positions, { nullable: true })
  @JoinColumn({ name: 'region_id' })
  region: Regions | null;

  @ManyToOne(() => ApplicantEmployers, (ae) => ae.positions)
  @JoinColumn({ name: 'applicant_employer_id' })
  applicant_employer: ApplicantEmployers;
}