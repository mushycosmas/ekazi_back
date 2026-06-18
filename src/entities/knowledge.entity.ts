// src/entities/applicants/knowledge.entity.ts
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
} from 'typeorm';
import { ApplicantKnowledge } from './applicants/applicant-knowledge.entity';
import { JobKnowledge } from 'src/jobs/entities/job-knowledge.entity';

@Entity('knowledge')
export class Knowledge {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  knowledge_name: string | null;

  @Column({ type: 'boolean', default: false })
  hide: boolean;

  @Column({ type: 'int', unsigned: true, nullable: true })
  creator_id: number | null;

  @Column({ type: 'int', unsigned: true, nullable: true })
  updator_id: number | null;

  @Column({ type: 'timestamp', nullable: true })
  created_at: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  updated_at: Date | null;

  // ----------------------
  // Relations
  // ----------------------
  @OneToMany(
    () => ApplicantKnowledge,
    (applicantKnowledge) => applicantKnowledge.knowledge,
  )
  applicant_knowledge: ApplicantKnowledge[];

  @OneToMany(
    () => JobKnowledge,
    (jobKnowledge) => jobKnowledge.knowledge,
  )
  jobKnowledge: JobKnowledge[];
}