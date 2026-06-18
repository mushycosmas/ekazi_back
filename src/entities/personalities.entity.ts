// src/entities/personalities.entity.ts
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
} from 'typeorm';
import { ApplicantPersonalities } from './applicants/applicant-personalities.entity';
import { JobPersonalities } from 'src/jobs/entities/job-personalities.entity';

@Entity('personalities')
export class Personalities {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({ type: 'int', unsigned: true })
  creator_id: number;

  @Column({ type: 'int', unsigned: true })
  updator_id: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  personality_name: string | null;

  @Column({ type: 'boolean', default: false })
  hide: boolean;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', nullable: true })
  created_at: Date | null;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', nullable: true })
  updated_at: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  deleted_at: Date | null;

  // ----------------------
  // Reverse relation
  // ----------------------
  @OneToMany(() => ApplicantPersonalities, (ap) => ap.personality)
  applicant_personalities: ApplicantPersonalities[];

  @OneToMany(() => JobPersonalities, (jobPersonality) => jobPersonality.personality,)
  jobPersonalities: JobPersonalities[];
}