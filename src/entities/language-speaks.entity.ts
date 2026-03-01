// src/entities/applicants/language-speaks.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Languages } from './languages.entity';
import { ApplicantLanguages } from './applicants/applicant-languages.entity';

@Entity('language_speaks')
export class LanguageSpeaks {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({ type: 'int', unsigned: true, name: 'language_id' })
  language_id: number;

  @Column({ type: 'varchar', length: 100 })
  speak_ability: string;

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
  @ManyToOne(() => Languages, (language) => language.speaks)
  @JoinColumn({ name: 'language_id' })
  language: Languages;

  @OneToMany(() => ApplicantLanguages, (applicantLang) => applicantLang.speak)
  applicants: ApplicantLanguages[];
}