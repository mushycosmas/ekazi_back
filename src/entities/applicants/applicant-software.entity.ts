// src/entities/applicants/applicant-software.entity.ts
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  Unique,
  JoinColumn,
} from 'typeorm';
import { Applicants } from './applicants.entity';
import { Softwares } from '../softwares.entity';

@Entity('applicant_software')
@Unique(['applicant_id', 'software_id'])
export class ApplicantSoftware {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({ type: 'int', unsigned: true })
  applicant_id: number;

  @Column({ type: 'int', unsigned: true })
  software_id: number;

  @Column({ type: 'timestamp', nullable: true })
  created_at: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  updated_at: Date | null;

  // ----------------------
  // Relations
  // ----------------------
  @ManyToOne(() => Applicants, (applicant) => applicant.applicant_software)
  @JoinColumn({ name: 'applicant_id' })
  applicant: Applicants;

  @ManyToOne(() => Softwares, (software) => software.applicant_software)
  @JoinColumn({ name: 'software_id' })
  software: Softwares;
}