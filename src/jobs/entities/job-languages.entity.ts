import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

 
import { Jobs } from './job.entity';
import { Languages } from 'src/entities/languages.entity';
import { LanguageReads } from 'src/entities/language-reads.entity';
import { LanguageWrites } from 'src/entities/language-writes.entity';
import { LanguageSpeaks } from 'src/entities/language-speaks.entity';
import { LanguageUnderstands } from 'src/entities/language-understands.entity';

@Entity('job_languages')
export class JobLanguages {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({ type: 'int', unsigned: true })
  job_id: number;

  @Column({ type: 'int', unsigned: true })
  read_id: number;

  @Column({ type: 'int', unsigned: true })
  write_id: number;

  @Column({ type: 'int', unsigned: true })
  speak_id: number;

  @Column({ type: 'int', unsigned: true })
  understand_id: number;

  @Column({ type: 'int', unsigned: true })
  language_id: number;

  @Column({ type: 'timestamp' })
  created_at: Date;

  @Column({ type: 'timestamp' })
  updated_at: Date;

  // ======================
  // RELATIONS
  // ======================

  @ManyToOne(() => Jobs, (job) => job.languages, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'job_id' })
  job: Jobs;

  @ManyToOne(() => Languages, (lang) => lang.jobLanguages, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'language_id' })
  language: Languages;

  @ManyToOne(() => LanguageReads)
  @JoinColumn({ name: 'read_id' })
  read: LanguageReads;

  @ManyToOne(() => LanguageWrites)
  @JoinColumn({ name: 'write_id' })
  write: LanguageWrites;

  @ManyToOne(() => LanguageSpeaks)
  @JoinColumn({ name: 'speak_id' })
  speak: LanguageSpeaks;

  @ManyToOne(() => LanguageUnderstands)
  @JoinColumn({ name: 'understand_id' })
  understand: LanguageUnderstands;
}