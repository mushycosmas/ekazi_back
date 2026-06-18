import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
} from 'typeorm';

import { Plans } from './plans.entity';

@Entity('plan_types')
export class PlanTypes {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({ length: 200 })
  name: string;

  @Column({ length: 200 })
  slug: string;

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

  // ======================
  // Relations
  // ======================

  @OneToMany(
    () => Plans,
    (plan) => plan.planType,
  )
  plans: Plans[];
}