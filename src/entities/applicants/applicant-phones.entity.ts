// src/entities/applicants/applicant-phones.entity.ts
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Applicants } from './applicants.entity';

@Entity('applicant_phones')
export class ApplicantPhones {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({ type: 'int', unsigned: true })
  applicant_id: number;

  @Column({ type: 'varchar', length: 100 })
  phone_number: string;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;

  // ---------------------
  // Relations
  // ---------------------
  @ManyToOne(() => Applicants, (applicant) => applicant.applicant_phones)
  @JoinColumn({ name: 'applicant_id' })
  applicant: Applicants;
}