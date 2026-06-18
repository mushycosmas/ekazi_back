import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';


import { Users } from 'src/entities/users.entity';

@Entity('job_evaluation_generals')
export class JobEvaluationGenerals {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({
    type: 'varchar',
    length: 255,
  })
  group: string;

  @Column({
    type: 'varchar',
    length: 255,
  })
  name: string;

  @Column({
    type: 'int',
    default: 0,
  })
  hide: number;

  @Column({
    type: 'int',
    nullable: true,
  })
  user_id: number | null;

  @Column({
    type: 'datetime',
    nullable: true,
  })
  created_at: Date | null;

  @Column({
    type: 'datetime',
    nullable: true,
  })
  updated_at: Date | null;

  // ======================
  // Relations
  // ======================

  @ManyToOne(
    () => Users,
    (user) => user.evaluationGenerals,
    {
      nullable: true,
    },
  )
  @JoinColumn({ name: 'user_id' })
  user: Users;
}