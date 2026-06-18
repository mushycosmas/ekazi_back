// src/entities/cultures.entity.ts
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
} from 'typeorm';
import { ApplicantCultures } from './applicants/applicant-cultures.entity';
import { JobCultures } from 'src/jobs/entities/job-cultures.entity';

@Entity('cultures')
export class Cultures {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({ type: 'int', unsigned: true, nullable: true })
  creator_id: number | null;

  @Column({ type: 'int', unsigned: true, nullable: true })
  updator_id: number | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  culture_name: string | null;

  @Column({ type: 'boolean', default: false })
  hide: boolean;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', nullable: true })
  created_at: Date | null;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', nullable: true })
  updated_at: Date | null;

  // ----------------------
  // Reverse relations
  // ----------------------
  @OneToMany(() => ApplicantCultures, (ac) => ac.culture)
  applicant_cultures: ApplicantCultures[];

  @OneToMany( () => JobCultures, (jobCulture) => jobCulture.culture,)
  jobCultures: JobCultures[];
}