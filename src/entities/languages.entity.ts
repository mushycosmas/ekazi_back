// src/entities/applicants/languages.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';

import { ApplicantLanguages } from './applicants/applicant-languages.entity';
import { LanguageReads } from './language-reads.entity';
import { LanguageWrites } from './language-writes.entity';
import { LanguageSpeaks } from './language-speaks.entity';
import { LanguageUnderstands } from './language-understands.entity';

@Entity('languages')
export class Languages {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({ type: 'varchar', length: 100 })
  language_name: string;

  @Column({ type: 'boolean', default: false })
  hide: boolean;

  @Column({ type: 'int', unsigned: true, nullable: true })
  creator_id: number | null;

  @Column({ type: 'int', unsigned: true, nullable: true })
  updator_id: number | null;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;

  // ---------------------
  // Relations
  // ---------------------
  @OneToMany(() => LanguageReads, (read) => read.language)
  reads: LanguageReads[];

  @OneToMany(() => LanguageWrites, (write) => write.language)
  writes: LanguageWrites[];

  @OneToMany(() => LanguageSpeaks, (speak) => speak.language)
  speaks: LanguageSpeaks[];

  @OneToMany(() => LanguageUnderstands, (understand) => understand.language)
  understands: LanguageUnderstands[];

  @OneToMany(() => ApplicantLanguages, (applicantLang) => applicantLang.language)
  applicants: ApplicantLanguages[];
}