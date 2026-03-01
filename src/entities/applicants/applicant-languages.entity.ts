// src/entities/applicants/applicant-languages.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Applicants } from './applicants.entity';
import { Languages } from '../languages.entity';
import { LanguageReads } from '../language-reads.entity';
import { LanguageWrites } from '../language-writes.entity';
import { LanguageSpeaks } from '../language-speaks.entity';
import { LanguageUnderstands } from '../language-understands.entity';

@Entity('applicant_languages')
export class ApplicantLanguages {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({ type: 'int', unsigned: true, name: 'read_id' })
  read_id: number;

  @Column({ type: 'int', unsigned: true, name: 'write_id' })
  write_id: number;

  @Column({ type: 'int', unsigned: true, name: 'speak_id' })
  speak_id: number;

  @Column({ type: 'int', unsigned: true, name: 'understand_id' })
  understand_id: number;

  @Column({ type: 'int', unsigned: true, name: 'applicant_id' })
  applicant_id: number;

  @Column({ type: 'int', unsigned: true, name: 'language_id' })
  language_id: number;

 

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;

  // ---------------------
  // Relations
  // ---------------------
  @ManyToOne(() => Applicants, (applicant) => applicant.applicant_languages)
  @JoinColumn({ name: 'applicant_id' })
  applicant: Applicants;

  @ManyToOne(() => Languages, (language) => language.applicant_languages)
  @JoinColumn({ name: 'language_id' })
  language: Languages;

  @ManyToOne(() => LanguageReads, (read) => read.applicants)
  @JoinColumn({ name: 'read_id' })
  read: LanguageReads;

  @ManyToOne(() => LanguageWrites, (write) => write.applicants)
  @JoinColumn({ name: 'write_id' })
  write: LanguageWrites;

  @ManyToOne(() => LanguageSpeaks, (speak) => speak.applicants)
  @JoinColumn({ name: 'speak_id' })
  speak: LanguageSpeaks;

  @ManyToOne(() => LanguageUnderstands, (understand) => understand.applicants)
  @JoinColumn({ name: 'understand_id' })
  understand: LanguageUnderstands;
}