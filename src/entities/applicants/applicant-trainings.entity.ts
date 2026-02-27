// src/entities/applicants/applicant-trainings.entity.ts
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Applicants } from './applicants.entity';
@Entity('applicant_trainings')
export class ApplicantTrainings {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({ type: 'int', unsigned: true, nullable: true })
  applicant_id: number | null;

  @Column({ type: 'varchar', length: 200 })
  name: string;

  @Column({ type: 'varchar', length: 200 })
  institution: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'date', nullable: true })
  started: Date | null;

  @Column({ type: 'date', nullable: true })
  ended: Date | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  attachment: string | null;

  @Column({ type: 'boolean', default: false })
  hide: boolean;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;

  @ManyToOne(() => Applicants, (applicant) => applicant.applicant_trainings, {
    nullable: true,
  })
  @JoinColumn({ name: 'applicant_id' })
  applicant: Applicants | null;
}