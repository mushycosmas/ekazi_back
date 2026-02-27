// src/entities/applicants/language-understands.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany } from 'typeorm';
import { Languages } from './languages.entity';
import { ApplicantLanguages } from './applicants/applicant-languages.entity';

@Entity('language_understands')
export class LanguageUnderstands {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({ type: 'int', unsigned: true })
  language_id: number;

  @Column({ type: 'varchar', length: 100 })
  understand_ability: string;

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

  @ManyToOne(() => Languages, (language) => language.understands)
  language: Languages;

  @OneToMany(() => ApplicantLanguages, (applicantLang) => applicantLang.understand)
  applicants: ApplicantLanguages[];
}