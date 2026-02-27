// src/entities/applicants/softwares.entity.ts
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
} from 'typeorm';
import { ApplicantSoftware } from './applicants/applicant-software.entity';

@Entity('softwares')
export class Softwares {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  software_name: string | null;

  @Column({ type: 'boolean', default: false })
  hide: boolean;

  @Column({ type: 'int', unsigned: true })
  creator_id: number;

  @Column({ type: 'int', unsigned: true })
  updator_id: number;

  @Column({ type: 'timestamp', nullable: true })
  deleted_at: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  created_at: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  updated_at: Date | null;

  // ----------------------
  // Relations
  // ----------------------
  @OneToMany(() => ApplicantSoftware, (as) => as.software)
  applicant_software: ApplicantSoftware[];
}