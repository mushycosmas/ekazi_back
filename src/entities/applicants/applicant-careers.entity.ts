// src/entities/applicants/applicant-careers.entity.ts
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  OneToOne,
} from 'typeorm';
import { Applicants } from './applicants.entity';

@Entity('applicant_careers')
export class ApplicantCareers {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({ type: 'int', unsigned: true, unique: true })
  applicant_id: number;

  @Column({ type: 'text' })
  career: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;

  // ----------------------
  // Relation back to applicant
  // ----------------------
  @OneToOne(() => Applicants, (applicant) => applicant.applicant_career)
  @JoinColumn({ name: 'applicant_id' })
  applicant: Applicants;
}