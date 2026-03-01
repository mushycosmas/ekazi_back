// src/entities/applicants/applicant-personalities.entity.ts
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  Unique,
  JoinColumn,
} from 'typeorm';
import { Applicants } from './applicants.entity';
import { Personalities } from '../personalities.entity';

@Entity('applicant_personalities')
@Unique(['applicant_id', 'personality_id'])
export class ApplicantPersonalities {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({ type: 'int', unsigned: true, name: 'applicant_id' })
  applicant_id: number;

  @Column({ type: 'int', unsigned: true, name: 'personality_id' })
  personality_id: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', nullable: true })
  created_at: Date | null;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', nullable: true })
  updated_at: Date | null;

  // ----------------------
  // Relations
  // ----------------------
  @ManyToOne(() => Applicants, (applicant) => applicant.applicant_personalities)
  @JoinColumn({ name: 'applicant_id' })  // Add this line to explicitly specify the column
  applicant: Applicants;

  @ManyToOne(() => Personalities, (personality) => personality.applicant_personalities)
  @JoinColumn({ name: 'personality_id' })  // Add this line to explicitly specify the column
  personality: Personalities;
}