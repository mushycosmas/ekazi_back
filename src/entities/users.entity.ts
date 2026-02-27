// src/entities/users.entity.ts
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
} from 'typeorm';
import { Applicants } from './applicants/applicants.entity';


@Entity('users')
export class Users {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({ type: 'varchar', length: 200, nullable: true })
  provider: string | null;

  @Column({ type: 'text', nullable: true })
  provider_id: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  terms: string | null;

  @Column({ type: 'int', nullable: true })
  updator_id: number | null;

  @Column({ type: 'int', nullable: true })
  creator_id: number | null;

  @Column({ type: 'int', unsigned: true })
  role_id: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  username: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  email: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  password: string | null;

  @Column({ type: 'boolean', default: false })
  hide: boolean;

  @Column({ type: 'boolean', nullable: true })
  verified: boolean | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  verify_key: string | null;

  @Column({ type: 'timestamp', nullable: true })
  email_verified_at: Date | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  remember_token: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  temp_email: string | null;

  @Column({ type: 'datetime', nullable: true })
  created_at: Date | null;

  @Column({ type: 'datetime', nullable: true })
  updated_at: Date | null;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  password_changed_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  last_activity_at: Date | null;

  @Column({ type: 'int', nullable: true })
  client_id: number | null;

  // ----------------------
  // Relations
  // ----------------------


  @OneToMany(() => Applicants, (applicant) => applicant.user)
  applicants: Applicants[];
}