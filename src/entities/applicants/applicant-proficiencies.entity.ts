// src/entities/applicants/applicant-proficiencies.entity.ts
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Applicants } from './applicants.entity';
import { Proficiencies } from '../proficiencies.entity';
import { Organizations } from '../organizations.entity';

@Entity('applicant_proficiencies')
export class ApplicantProficiencies {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({ type: 'int', unsigned: true })
  organization_id: number;


  @Column({ type: 'int', unsigned: true })
  proficiency_id: number;

  @Column({ type: 'int', unsigned: true })
  applicant_id: number;

  @Column({ type: 'timestamp', nullable: true })
  started: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  ended: Date | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  course: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  award: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  attachment: string | null;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;

  // ----------------------
  // Relations
  // ----------------------
  @ManyToOne(() => Proficiencies, (proficiency) => proficiency.applicant_proficiencies)
  @JoinColumn({ name: 'proficiency_id' })
  proficiency: Proficiencies;

  @ManyToOne(() => Organizations, (organization) => organization.applicant_proficiencies)
  @JoinColumn({ name: 'organization_id' })
  organization: Organizations;

  

  @ManyToOne(() => Applicants, (applicant) => applicant.applicant_proficiencies)
  @JoinColumn({ name: 'applicant_id' })
  applicant: Applicants;
}