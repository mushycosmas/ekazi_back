
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
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

  @Column({ type: 'int', unsigned: true })
  read_id: number;

  @Column({ type: 'int', unsigned: true })
  write_id: number;

  @Column({ type: 'int', unsigned: true })
  speak_id: number;

  @Column({ type: 'int', unsigned: true })
  understand_id: number;

  @Column({ type: 'int', unsigned: true })
  applicant_id: number;

  @Column({ type: 'int', unsigned: true })
  language_id: number;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;

  // ---------------------
  // Relations
  // ---------------------
//   @ManyToOne(() => Applicants, (applicant) => applicant.languages)
//   applicant: Applicants;

  @ManyToOne(() => Languages, (language) => language.applicants)
  language: Languages;

  @ManyToOne(() => LanguageReads, (read) => read.applicants)
  read: LanguageReads;

  @ManyToOne(() => LanguageWrites, (write) => write.applicants)
  write: LanguageWrites;

  @ManyToOne(() => LanguageSpeaks, (speak) => speak.applicants)
  speak: LanguageSpeaks;

  @ManyToOne(() => LanguageUnderstands, (understand) => understand.applicants)
  understand: LanguageUnderstands;
}