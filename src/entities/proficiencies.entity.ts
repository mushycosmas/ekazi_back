// src/entities/applicants/proficiencies.entity.ts
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
} from 'typeorm';
import { ApplicantProficiencies } from './applicants/applicant-proficiencies.entity';

@Entity('proficiencies')
export class Proficiencies {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({ type: 'varchar', length: 200 })
  proficiency_name: string;

  @Column({ type: 'boolean', default: false })
  hide: boolean;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;

  // ----------------------
  // Reverse relation
  // ----------------------
  @OneToMany(
    () => ApplicantProficiencies,
    (applicantProficiency) => applicantProficiency.proficiency,
  )
  applicant_proficiencies: ApplicantProficiencies[];
}