// src/entities/applicants/organizations.entity.ts
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
} from 'typeorm';

import { ApplicantProficiencies } from './applicants/applicant-proficiencies.entity';

@Entity('organizations')
export class Organizations {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({ type: 'varchar', length: 200 })
  organization_name: string;

  @Column({ type: 'boolean', default: false })
  hide: boolean;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;

  @Column({ type: 'int', nullable: true, unsigned: true })
  updator_id: number | null;

  @Column({ type: 'int', nullable: true, unsigned: true })
  creator_id: number | null;

  // ----------------------
  // Reverse relation
  // ----------------------
  @OneToMany(
    () => ApplicantProficiencies,
    (applicantProficiency) => applicantProficiency.organization,
  )
  applicant_proficiencies: ApplicantProficiencies[];
}