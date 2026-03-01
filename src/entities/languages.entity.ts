// src/entities/languages.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { ApplicantLanguages } from './applicants/applicant-languages.entity';

@Entity('languages')
export class Languages {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({ type: 'varchar', length: 100, name: 'language_name' })
  language_name: string;

  @Column({ type: 'boolean', default: false })
  hide: boolean;

  @Column({ type: 'int', unsigned: true, nullable: true, name: 'creator_id' })
  creator_id: number | null;

  @Column({ type: 'int', unsigned: true, nullable: true, name: 'updator_id' })
  updator_id: number | null;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;

  // ---------------------
  // Relations
  // ---------------------
  @OneToMany(() => ApplicantLanguages, (applicantLang) => applicantLang.language)
  applicant_languages: ApplicantLanguages[];
}