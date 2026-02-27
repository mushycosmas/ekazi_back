// src/entities/applicants/applicant-cultures.entity.ts
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { Applicants } from './applicants.entity';
import { Cultures } from '../cultures.entity';

@Entity('applicant_cultures')
@Unique(['applicant_id', 'culture_id'])
export class ApplicantCultures {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({ type: 'int', unsigned: true })
  applicant_id: number;

  @Column({ type: 'int', unsigned: true })
  culture_id: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', nullable: true })
  created_at: Date | null;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', nullable: true })
  updated_at: Date | null;

  // ----------------------
  // Relations
  // ----------------------
  @ManyToOne(() => Applicants, (applicant) => applicant.applicant_cultures)
  @JoinColumn({ name: 'applicant_id' })
  applicant: Applicants;

  @ManyToOne(() => Cultures, (culture) => culture.applicant_cultures)
  @JoinColumn({ name: 'culture_id' })
  culture: Cultures;
}