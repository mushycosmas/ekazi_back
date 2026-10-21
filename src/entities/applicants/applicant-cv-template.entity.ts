
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import { Applicants } from './applicants.entity';

@Entity('applicnt_saved_resume')
export class ApplicantSavedResumes {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'int',
    nullable: true,
  })
  applicant_id: number | null;

  @Column({
    type: 'varchar',
    length: 300,
    nullable: true,
  })
  template: string | null;

  @Column({
    type: 'text',
    nullable: true,
  })
  cv_name: string | null;

  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  created_at: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updated_at: Date;

  @ManyToOne(() => Applicants, (applicant) => applicant.cvTemplates, {
    nullable: true,
  })
  @JoinColumn({ name: 'applicant_id' })
  applicant: Applicants | null;
}
