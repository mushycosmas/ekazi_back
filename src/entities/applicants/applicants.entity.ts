// src/entities/applicants/applicants.entity.ts
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';

import { Users } from '../users.entity';
import { MaritalStatuses } from '../marital-statuses.entity';
import { Genders } from '../genders.entity';
import { ApplicantReferees } from './applicant-referees.entity';
import { ApplicantCareers } from './applicant-careers.entity';
import { ApplicantTrainings } from './applicant-trainings.entity';
import { ApplicantCultures } from './applicant-cultures.entity';
import { ApplicantPersonalities } from './applicant-personalities.entity';
import { ApplicantTools } from './applicant-tools.entity';
import { ApplicantSoftware } from './applicant-software.entity';
import { ApplicantKnowledge } from './applicant-knowledge.entity';
import { ApplicantProficiencies } from './applicant-proficiencies.entity';
import { ApplicantAddresses } from './applicant-addresses.entity';
import { ApplicantPositions } from './applicant-positions.entity';
import { ApplicantPhones } from './applicant-phones.entity';
import { ApplicantEducation } from './applicant-education.entity';

import { ApplicantLanguages } from './applicant-languages.entity';

@Entity('applicants')
export class Applicants {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({ type: 'int', unsigned: true })
  user_id: number;

  @Column({ type: 'int', unsigned: true, nullable: true })
  marital_id: number | null;

  @Column({ type: 'int', unsigned: true, nullable: true })
  gender_id: number | null;

  @Column({ type: 'int', unsigned: true })
  nationality_id: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  picture: string | null;

  @Column({ type: 'text', nullable: true })
  background_picture: string | null;

  @Column({ type: 'varchar', length: 40, nullable: true })
  incomplete_notification: string | null;

  @Column({ type: 'int', default: 0 })
  unsubscribe: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  first_name: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  middle_name: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  last_name: string | null;

  @Column({ type: 'date', nullable: true })
  dob: Date | null;

  @Column({ type: 'int', default: 0 })
  test_attempt: number;

  @Column({ type: 'boolean', default: false })
  status_profile: boolean;

  @Column({ type: 'datetime', nullable: true })
  created_at: Date | null;

  @Column({ type: 'datetime', nullable: true })
  updated_at: Date | null;

  // -------------------
  // Relations
  // -------------------

  @ManyToOne(() => MaritalStatuses, (marital) => marital.applicants, { nullable: true })
  @JoinColumn({ name: 'marital_id' })
  marital: MaritalStatuses | null;

  @ManyToOne(() => Genders, (gender) => gender.applicants, { nullable: true })
  @JoinColumn({ name: 'gender_id' })
  gender: Genders | null;

  @ManyToOne(() => Users, (user) => user.applicants)
  @JoinColumn({ name: 'user_id' })
  user: Users;

  @OneToMany(() => ApplicantReferees, (ref) => ref.applicant)
  referees: ApplicantReferees[];

//   @OneToMany(() => Correspondences, (c) => c.applicant)
//   correspondences: Correspondences[];

  @OneToMany(() => ApplicantCareers, (ac) => ac.applicant)
  applicant_career: ApplicantCareers[];

  @OneToMany(() => ApplicantTrainings, (t) => t.applicant)
  applicant_trainings: ApplicantTrainings[];

  @OneToMany(() => ApplicantCultures, (c) => c.applicant)
  applicant_cultures: ApplicantCultures[];

  @OneToMany(() => ApplicantPersonalities, (p) => p.applicant)
  applicant_personalities: ApplicantPersonalities[];

  @OneToMany(() => ApplicantTools, (t) => t.applicant)
  applicant_tools: ApplicantTools[];

  @OneToMany(() => ApplicantSoftware, (s) => s.applicant)
  applicant_software: ApplicantSoftware[];

  @OneToMany(() => ApplicantKnowledge, (k) => k.applicant)
  applicant_knowledge: ApplicantKnowledge[];

  @OneToMany(() => ApplicantProficiencies, (p) => p.applicant)
  applicant_proficiencies: ApplicantProficiencies[];

  @OneToMany(() => ApplicantAddresses, (a) => a.applicant)
  addresses: ApplicantAddresses[];

  @OneToMany(() => ApplicantPhones, (p) => p.applicant)
  applicant_phones: ApplicantPhones[];

  @OneToMany(() => ApplicantEducation, (e) => e.applicant)
  applicant_education: ApplicantEducation[];

  @OneToMany(() => ApplicantPositions, (pos) => pos.applicant)
  positions: ApplicantPositions[];

//   @OneToMany(() => ApplicantLanguages, (appLang) => appLang.applicant)
// applicant_languages: ApplicantLanguages[];
}