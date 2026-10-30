
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import { Jobs } from '../../jobs/entities/job.entity';

@Entity('non_user_applications')
export class NonUserApplication {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', unsigned: true })
  job_id: number;

  @Column({ type: 'varchar', length: 100 })
  applicant_email: string;

  @Column({ type: 'varchar', length: 50 })
  application_type: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  full_name: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  phone: string | null;

  @Column({ type: 'text', nullable: true })
  note: string | null;

  @Column({ type: 'text', nullable: true })
  attachment: string | null;

  @CreateDateColumn({
    type: 'timestamp',
    name: 'created_at',
    default: () => 'CURRENT_TIMESTAMP',
  })
  created_at: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    name: 'updated_at',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updated_at: Date;

  @ManyToOne(() => Jobs, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'job_id' })
  job: Jobs;
}
