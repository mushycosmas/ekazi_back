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

@Entity('applicant_featured_views')
export class ApplicantViews {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  applicant_id: number;

  @Column({ type: 'int' })
  view_number: number;

  @Column({ type: 'int', nullable: true, default: null })
  like_number: number | null;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp',
    nullable: true,
  })
  created_at: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamp',
    nullable: true,
  })
  updated_at: Date;

  @ManyToOne(
    () => Applicants,
    (applicant) => applicant.applicantViews,
  )
  @JoinColumn({ name: 'applicant_id' })
  applicant: Applicants;
}