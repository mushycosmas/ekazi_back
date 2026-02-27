// src/entities/applicants/applicant-tools.entity.ts
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { Applicants } from './applicants.entity';
import { Tools } from '../tools.entity';

@Entity('applicant_tools')
@Unique(['applicant_id', 'tool_id'])
export class ApplicantTools {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({ type: 'int', unsigned: true })
  tool_id: number;

  @Column({ type: 'int', unsigned: true })
  applicant_id: number;

  @Column({ type: 'int', default: 0 })
  hide: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;

  // ----------------------
  // Relations
  // ----------------------
  @ManyToOne(() => Applicants, (applicant) => applicant.applicant_tools)
  @JoinColumn({ name: 'applicant_id' })
  applicant: Applicants;

  @ManyToOne(() => Tools, (tool) => tool.applicant_tools)
  @JoinColumn({ name: 'tool_id' })
  tools: Tools;
}