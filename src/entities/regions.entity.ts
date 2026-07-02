import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Countries } from './countries.entity';
import { ApplicantAddresses } from './applicants/applicant-addresses.entity';
import { ApplicantPositions } from './applicants/applicant-positions.entity';
import { Jobs } from 'src/jobs/entities/job.entity';
import { JobAddresses } from 'src/jobs/entities/job-addresses.entity';
import { ClientAddress } from 'src/client/entities/client-address.entity';

@Entity('regions')
export class Regions {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({ type: 'int', unsigned: true })
  country_id: number;

  @Column({ type: 'varchar', length: 100 })
  region_name: string;

  @Column({ type: 'varchar', length: 200 })
  slug: string;

  @Column({ type: 'boolean', default: false })
  hide: boolean;

  @Column({ type: 'int', nullable: true, unsigned: true })
  updator_id: number | null;

  @Column({ type: 'int', nullable: true, unsigned: true })
  creator_id: number | null;

  @Column({ type: 'timestamp', nullable: true })
  deleted_at: Date | null;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;

  // ---------------------
  // Relations
  // ---------------------
  @ManyToOne(() => Countries, (country) => country.regions)
  @JoinColumn({ name: 'country_id' })
  country: Countries;

  @OneToMany(() => ApplicantAddresses, (address) => address.region)
  applicant_addresses: ApplicantAddresses[];

  @OneToMany(() => ApplicantPositions, (position) => position.region)
  positions: ApplicantPositions[];

  @OneToMany(() => Jobs, (job) => job.region)
  jobs: Jobs[];
  @OneToMany(() => JobAddresses, (address) => address.region,)
  jobAddresses: JobAddresses[];

  @OneToMany(() => ClientAddress, (address) => address.region)
  clientAddresses: ClientAddress[];
}