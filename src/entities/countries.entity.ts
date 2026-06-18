
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
} from 'typeorm';

import { Regions } from './regions.entity';
import { Jobs } from 'src/jobs/entities/job.entity';

@Entity('countries')
export class Countries {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  name: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  citizenship: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  country_code: string | null;

  @Column({ type: 'varchar', length: 30, nullable: true })
  alpha_code: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  currency: string | null;

  @Column({ type: 'int', nullable: true, unsigned: true })
  creator_id: number | null;

  @Column({ type: 'int', nullable: true, unsigned: true })
  updator_id: number | null;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

   
  @Exclude()
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;

  @Column({ type: 'boolean', default: false })
  hide: boolean;

  @OneToMany(() => Regions, (region) => region.country)
  regions: Regions[];

  @OneToMany(() => Jobs, (job) => job.country)
  jobs: Jobs[];
}