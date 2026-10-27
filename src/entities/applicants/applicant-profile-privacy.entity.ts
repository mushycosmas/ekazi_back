import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Applicants } from 'src/entities/applicants/applicants.entity';
import { Status } from '../status.entity';

@Entity('applicant_statuses')
@Index(['applicant_id', 'status_id'], { unique: true })
export class ApplicantProfilePrivacy {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'int',
    unsigned: true,
    nullable: true,
  })
  applicant_id: number | null;

  @Column({
    type: 'int',
    unsigned: true,
    nullable: true,
  })
  status_id: number | null;

  @Column({
    type: 'int',
    nullable: true,
  })
  value: number | null;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp',
  })
  created_at: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamp',
  })
  updated_at: Date;

  @ManyToOne(() => Applicants, { nullable: true })
  @JoinColumn({ name: 'applicant_id' })
  applicant: Applicants;

  @ManyToOne(() => Status, { nullable: true })
  @JoinColumn({ name: 'status_id' })
  status: Status;

}