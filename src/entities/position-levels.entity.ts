import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
} from 'typeorm';
import { ApplicantPositions } from './applicants/applicant-positions.entity';
import { Jobs } from 'src/jobs/entities/job.entity';

@Entity('position_levels')
export class PositionLevels {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({ type: 'varchar', length: 100 })
  position_name: string;

  @Column({ type: 'int', default: 0 })
  hide: number;

  @Column({ type: 'int' })
  creator_id: number;

  @Column({ type: 'int' })
  updator_id: number;

  @Column({ type: 'timestamp', nullable: true })
  deleted_at: Date | null;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;

  // ---------------------
  // Reverse relation: one position level can have many applicant positions
  // ---------------------
  @OneToMany(() => ApplicantPositions, (ap) => ap.position_level)
  applicant_positions: ApplicantPositions[];

  @OneToMany(() => Jobs, (job) => job.positionLevel)
  jobs: Jobs[];
}