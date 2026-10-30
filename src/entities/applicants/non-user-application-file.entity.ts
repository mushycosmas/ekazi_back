
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import { NonUserApplication } from './non-user-application.entity';

@Entity('non_user_application_files')
export class NonUserApplicationFile {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  non_user_application_id: number;

  @Column({ type: 'text' })
  file_path: string;

  @Column({ type: 'varchar', length: 200 })
  original_name: string;

  @CreateDateColumn({
    type: 'timestamp',
    name: 'created_at',
    default: () => 'CURRENT_TIMESTAMP',
  })
  created_at: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    name: 'updated_at',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updated_at: Date;

  @ManyToOne(
    () => NonUserApplication,
    { onDelete: 'CASCADE' },
  )
  @JoinColumn({ name: 'non_user_application_id' })
  application: NonUserApplication;
}
