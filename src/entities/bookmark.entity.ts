import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import { Applicants } from 'src/entities/applicants/applicants.entity';

@Entity('bookmarks')
export class Bookmark {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ type: 'int' })
  applicant_id: number;

  @Column({ type: 'int' })
  template_id: number;

  @Column({
    type: 'tinyint',
    width: 1,
    default: 1,
  })
  status: boolean;

  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  created_at: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updated_at: Date;

  // Relationship with Applicants
  @ManyToOne(() => Applicants, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'applicant_id' })
  applicant: Applicants;
}