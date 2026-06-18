import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

 
import { Jobs } from './job.entity';
import { Regions } from 'src/entities/regions.entity';

@Entity('job_addresses')
export class JobAddresses {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({ unsigned: true })
  job_id: number;

  @Column()
  region_id: number;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  sub_location: string | null;

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

  @ManyToOne(() => Jobs, (job) => job.addresses)
  @JoinColumn({ name: 'job_id' })
  job: Jobs;

  @ManyToOne(() => Regions, (region) => region.jobAddresses)
  @JoinColumn({ name: 'region_id' })
  region: Regions;
}