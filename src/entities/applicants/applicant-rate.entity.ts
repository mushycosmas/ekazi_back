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

@Entity('applicant_rates')
export class ApplicantRate {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', nullable: true })
  applicant_id: number | null;

  @Column({ type: 'int', nullable: true })
  user_id: number | null;

  @Column({ type: 'varchar', length: 50 })
  ip_address: string;

  @Column({ type: 'int', nullable: true })
  creator_id: number | null;

  @Column({ type: 'int' })
  rate: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  comment: string | null;

  @Column({ type: 'timestamp', nullable: true })
  deleted_at: Date | null;

  @UpdateDateColumn({
    type: 'timestamp',
    nullable: true,
  })
  updated_at: Date | null;

  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  created_at: Date;

  @ManyToOne(
    () => Applicants,
    (applicant) => applicant.applicantRates,
    { nullable: true },
  )
  @JoinColumn({ name: 'applicant_id' })
  applicant: Applicants;
}