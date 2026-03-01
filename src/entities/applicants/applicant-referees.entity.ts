// src/entities/applicants/applicant-referees.entity.ts
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Applicants } from './applicants.entity';

@Entity('applicant_referees')
export class ApplicantReferees {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  // @Column({ type: 'int', unsigned: true, nullable: true })
  // created_by: number | null;

  @Column({ type: 'int', unsigned: true })
  applicant_id: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  first_name: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  middle_name: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  last_name: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  employer: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  referee_position: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  email: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  phone: string | null;

  @Column({ type: 'varchar', length: 15, nullable: true })
  type: string | null;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;

  // ----------------------
  // Relation back to applicant
  // ----------------------
  @ManyToOne(() => Applicants, (applicant) => applicant.referees)
  @JoinColumn({ name: 'applicant_id' })
  applicant: Applicants;
}