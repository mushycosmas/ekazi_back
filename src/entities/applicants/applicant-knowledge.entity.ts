// src/entities/applicants/applicant-knowledge.entity.ts
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  Unique,
  JoinColumn,
} from 'typeorm';
import { Applicants } from './applicants.entity';
import { Knowledge } from '../knowledge.entity';

@Entity('applicant_knowledge')
@Unique(['applicant_id', 'knowledge_id'])
export class ApplicantKnowledge {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({ type: 'int', unsigned: true })
  applicant_id: number;

  @Column({ type: 'int', unsigned: true })
  knowledge_id: number;

  @Column({ type: 'timestamp', nullable: true })
  created_at: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  updated_at: Date | null;

  // ----------------------
  // Relations
  // ----------------------
  @ManyToOne(() => Applicants, (applicant) => applicant.applicant_knowledge)
  @JoinColumn({ name: 'applicant_id' })
  applicant: Applicants;

  @ManyToOne(() => Knowledge, (knowledge) => knowledge.applicant_knowledge)
  @JoinColumn({ name: 'knowledge_id' })
  knowledge: Knowledge;
}