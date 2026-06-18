import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import { Jobs } from './job.entity';
import { Clients } from 'src/client/clients.entity';
import { Applicants } from 'src/entities/applicants/applicants.entity';

@Entity('job_alerts')
export class JobAlerts {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  job_id: number;

  @Column()
  client_id: number;

  @Column()
  applicant_id: number;

  @Column()
  status: number;

  @Column({
    type: 'timestamp',
    nullable: true,
  })
  deleted_at: Date | null;

  @Column({
    type: 'timestamp',
    nullable: true,
  })
  created_at: Date | null;

  @Column({
    type: 'timestamp',
  })
  updated_at: Date;

  // ======================
  // Relations
  // ======================

  @ManyToOne(() => Jobs, (job) => job.jobAlerts)
  @JoinColumn({ name: 'job_id' })
  job: Jobs;

  @ManyToOne(() => Clients, (client) => client.jobAlerts)
  @JoinColumn({ name: 'client_id' })
  client: Clients;

  @ManyToOne(() => Applicants, (applicant) => applicant.jobAlerts)
  @JoinColumn({ name: 'applicant_id' })
  applicant: Applicants;
}