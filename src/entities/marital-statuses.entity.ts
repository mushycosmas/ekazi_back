// src/entities/marital-statuses.entity.ts
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
} from 'typeorm';
import { Applicants } from './applicants/applicants.entity';

@Entity('marital_statuses')
export class MaritalStatuses {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({ type: 'int', unsigned: true })
  creator_id: number;

  @Column({ type: 'int', unsigned: true })
  updator_id: number;

  @Column({ type: 'boolean', default: false })
  hide: boolean;

  @Column({ type: 'varchar', length: 100 })
  marital_status: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;

  // ----------------------
  // Reverse relation: one marital status can have many applicants
  // ----------------------
  @OneToMany(() => Applicants, (applicant) => applicant.marital)
  applicants: Applicants[];
}