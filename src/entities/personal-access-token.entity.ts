// src/auth/entities/personal-access-token.entity.ts

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('personal_access_tokens')
export class PersonalAccessToken {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  tokenable_type: string;

  @Column()
  tokenable_id: number;

  @Column()
  name: string;

  @Column({ unique: true, type: 'text' })
  token: string;

  @Column({ type: 'text', nullable: true })
  abilities: string;

  @Column({ type: 'timestamp', nullable: true })
  last_used_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  expires_at: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}