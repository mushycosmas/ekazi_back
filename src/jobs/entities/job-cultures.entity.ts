import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
 
import { Jobs } from './job.entity';
import { Cultures } from 'src/entities/cultures.entity';

@Entity('job_cultures')
export class JobCultures {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({ unsigned: true })
  job_id: number;

  @Column({ unsigned: true })
  culture_id: number;

  @Column({
    type: 'timestamp',
    nullable: true,
  })
  created_at: Date | null;

  @Column({
    type: 'timestamp',
    nullable: true,
  })
  updated_at: Date | null;

  // ======================
  // Relations
  // ======================

  @ManyToOne(
    () => Jobs,
    (job) => job.jobCultures,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'job_id' })
  job: Jobs;

  @ManyToOne(
    () => Cultures,
    (culture) => culture.jobCultures,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'culture_id' })
  culture: Cultures;
}