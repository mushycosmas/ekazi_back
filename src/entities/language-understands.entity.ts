// src/entities/language-understands.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { ApplicantLanguages } from './applicants/applicant-languages.entity';
import { JobLanguages } from 'src/jobs/entities/job-languages.entity';


@Entity('language_understands')
export class LanguageUnderstands {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({ type: 'varchar', length: 100, name: 'understand_ability' })
  understand_ability: string;

  @Column({ type: 'int', unsigned: true, nullable: true, name: 'creator_id' })
  creator_id: number | null;

  @Column({ type: 'int', unsigned: true, nullable: true, name: 'updator_id' })
  updator_id: number | null;

  @Column({ type: 'boolean', default: false })
  hide: boolean;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;

  // ---------------------
  // Relations
  // ---------------------
  @OneToMany(() => ApplicantLanguages, (applicantLang) => applicantLang.understand)
  applicants: ApplicantLanguages[];

  
  @OneToMany(() => JobLanguages, (jobLanguage) => jobLanguage.understand,)
  jobLanguages: JobLanguages[];
}