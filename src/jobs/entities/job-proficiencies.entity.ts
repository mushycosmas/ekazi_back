import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import { Jobs } from './job.entity';
import { Proficiencies } from 'src/entities/proficiencies.entity';

@Entity('job_proficiencies')
export class JobProficiencies {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({ type: 'int', unsigned: true })
  job_id: number;

  @Column({ type: 'int', unsigned: true })
  proficiency_id: number;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  created_at: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  updated_at: Date;

  // Job Relation
  @ManyToOne(() => Jobs, (job) => job.jobProficiencies, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'job_id' })
  job: Jobs;

  // Proficiency Relation
  @ManyToOne(
    () => Proficiencies,
    (proficiency) => proficiency.jobProficiencies,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'proficiency_id' })
  proficiency: Proficiencies;
}