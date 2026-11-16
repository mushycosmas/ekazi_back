import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';

import { Correspondence } from './correspondence.entity';

@Entity('correspondence_attachments')
@Index(['correspondence_id'])
export class CorrespondenceAttachment {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
  id: number;

  @Column({ type: 'int', unsigned: true })
  correspondence_id: number;

  @Column({ type: 'varchar', length: 255 })
  original_name: string;

  @Column({ type: 'varchar', length: 255 })
  file_name: string;

  @Column({ type: 'varchar', length: 500 })
  file_path: string;

  @Column({ type: 'varchar', length: 100 })
  mime_type: string;

  @Column({ type: 'bigint', unsigned: true })
  file_size: number;

  @CreateDateColumn({ type: 'timestamp', nullable: true })
  created_at: Date;

  @ManyToOne(
    () => Correspondence,
    (correspondence) => correspondence.attachments,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'correspondence_id' })
  correspondence: Correspondence;
}