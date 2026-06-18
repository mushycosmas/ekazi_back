import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

 
import { Jobs } from './job.entity';
import { Personalities } from 'src/entities/personalities.entity';

@Entity('job_personalities')
export class JobPersonalities {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({ type: 'int', unsigned: true })
  job_id: number;

  @Column({ type: 'int', unsigned: true })
  personality_id: number;

  @Column({
    type: 'timestamp',
    nullable: true,
  })
  created_at: Date;

  @Column({
    type: 'timestamp',
    nullable: true,
  })
  updated_at: Date;

  // ======================
  // Relations
  // ======================

  @ManyToOne(
    () => Jobs,
    (job) => job.jobPersonalities,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'job_id' })
  job: Jobs;

  @ManyToOne(
    () => Personalities,
    (personality) => personality.jobPersonalities,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'personality_id' })
  personality: Personalities;
}