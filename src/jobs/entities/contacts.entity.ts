import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
} from 'typeorm';

import { Jobs } from './job.entity';


@Entity('contacts')
export class Contacts {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column('text')
  name: string;

  @Column('text')
  email: string;

  @Column('text', { nullable: true })
  description: string;

  @Column('text', { nullable: true })
  message: string;

  @Column('text', { nullable: true })
  address: string;

  @Column('text', { nullable: true })
  phone: string;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  created_at: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  updated_at: Date;

  @OneToMany(() => Jobs, (job) => job.contact)
  jobs: Jobs[];
}