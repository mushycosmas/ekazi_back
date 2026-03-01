// src/entities/applicants/language-writes.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Languages } from './languages.entity';
import { ApplicantLanguages } from './applicants/applicant-languages.entity';

@Entity('language_writes')
export class LanguageWrites {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({ type: 'int', unsigned: true, name: 'language_id' })
  language_id: number;

  @Column({ type: 'varchar', length: 100 })
  write_ability: string;

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
  @ManyToOne(() => Languages, (language) => language.writes)
  @JoinColumn({ name: 'language_id' })
  language: Languages;

  @OneToMany(() => ApplicantLanguages, (applicantLang) => applicantLang.write)
  applicants: ApplicantLanguages[];
}