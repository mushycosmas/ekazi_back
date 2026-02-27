// src/entities/genders.entity.ts
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
} from 'typeorm';
import { Applicants } from './applicants/applicants.entity';

@Entity('genders')
export class Genders {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({ type: 'varchar', length: 100 })
  gender_name: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;

  @Column({ type: 'int', unsigned: true, nullable: true })
  creator_id: number | null;

  @Column({ type: 'int', unsigned: true, nullable: true })
  updator_id: number | null;

  @Column({ type: 'boolean', default: false })
  hide: boolean;

  // ----------------------
  // Reverse relation: one gender can have many applicants
  // ----------------------
  @OneToMany(() => Applicants, (applicant) => applicant.gender)
  applicants: Applicants[];
}