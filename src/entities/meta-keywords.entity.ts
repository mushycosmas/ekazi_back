import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
} from 'typeorm';

 
import { JobMetas } from 'src/jobs/entities/job-metas.entity';

export enum EntityType {
  JOB = 'job',
  SYSTEM = 'system',
  CV = 'cv',
}

@Entity('meta_keywords')
export class MetaKeywords {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: EntityType,
  })
  entity_type: EntityType;

  @Column({
    type: 'text',
  })
  name: string;

  @Column({
    nullable: true,
  })
  creator_id: number;

  @Column({
    nullable: true,
  })
  updator_id: number;

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

  // ======================
  // Relations
  // ======================

  @OneToMany(
    () => JobMetas,
    (jobMeta) => jobMeta.metaKeyword,
  )
  jobMetas: JobMetas[];
}