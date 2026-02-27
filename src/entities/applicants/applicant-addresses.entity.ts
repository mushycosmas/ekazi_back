import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Applicants } from './applicants.entity';
import { Regions } from '../regions.entity';

@Entity('applicant_addresses')
export class ApplicantAddresses {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({ type: 'int', unsigned: true })
  applicant_id: number;

  @Column({ type: 'int', unsigned: true })
  region_id: number;

  @Column({ type: 'varchar', length: 100 })
  sub_location: string;

  @Column({ type: 'varchar', length: 200 })
  postal: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;

  // ---------------------
  // Relations
  // ---------------------
  @ManyToOne(() => Applicants, (applicant) => applicant.addresses)
  @JoinColumn({ name: 'applicant_id' })
  applicant: Applicants;

  @ManyToOne(() => Regions, (region) => region.applicant_addresses)
  @JoinColumn({ name: 'region_id' })
  region: Regions;
}