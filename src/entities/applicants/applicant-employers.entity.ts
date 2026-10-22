// 
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import { ApplicantPositions } from './applicant-positions.entity';
import { Regions } from '../regions.entity';

@Entity('applicant_employers')
export class ApplicantEmployers {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({ type: 'varchar', length: 200 })
  employer_name: string;

  @Column({ type: 'int' })
  region_id: number;

  @Column({ type: 'varchar', length: 100 })
  sub_location: string;

  @Column({
    type: 'datetime',
    default: () => 'CURRENT_TIMESTAMP',
  })
  created_at: Date;

  @Column({
    type: 'datetime',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updated_at: Date;

  @ManyToOne(() => Regions, { nullable: false })
  @JoinColumn({ name: 'region_id' })
  region: Regions;

  @OneToMany(
    () => ApplicantPositions,
    (pos) => pos.applicant_employer,
  )
  positions: ApplicantPositions[];
}