// src/entities/applicants/language-reads.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Languages } from './languages.entity';
import { ApplicantLanguages } from './applicants/applicant-languages.entity';

@Entity('language_reads')
export class LanguageReads {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({ type: 'int', unsigned: true, name: 'language_id' })
  language_id: number;

  @Column({ type: 'varchar', length: 100 })
  read_ability: string;

  @Column({ type: 'int', unsigned: true, nullable: true })
  creator_id: number | null;

  @Column({ type: 'int', unsigned: true, nullable: true })
  updator_id: number | null;

  @Column({ type: 'boolean', default: false })
  hide: boolean;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;

  // FIXED: Add JoinColumn to explicitly specify the foreign key column name
  @ManyToOne(() => Languages, (language) => language.reads)
  @JoinColumn({ name: 'language_id' })  // This tells TypeORM to use 'language_id' instead of 'languageId'
  language: Languages;

  @OneToMany(() => ApplicantLanguages, (applicantLang) => applicantLang.read)
  applicants: ApplicantLanguages[];
}