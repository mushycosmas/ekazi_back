import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';

 

import { Clients } from './clients.entity';
import { Plans } from 'src/entities/plans.entity';
import { JobPlans } from 'src/jobs/entities/job-plans.entity';
import { PaymentMethods } from 'src/entities/payment-methods.entity';

@Entity('client_subscription_payments')
export class ClientSubscriptionPayments {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({ unsigned: true })
  client_id: number;

  @Column()
  plan_id: number;

  @Column()
  price_id: number;

  @Column({ nullable: true })
  job_subscription_memberships_id: number;

  @Column({ unsigned: true })
  payment_method_id: number;

  @Column({ type: 'text', nullable: true })
  comments: string;

  @Column({ type: 'text', nullable: true })
  price: string;

  @Column({ type: 'date', nullable: true })
  start_date: Date;

  @Column({ type: 'date', nullable: true })
  end_date: Date;

  @Column({ type: 'boolean', default: false })
  status: boolean;

  @Column({ type: 'int', unsigned: true })
  verification: number;

  @Column({ type: 'boolean', default: true })
  active: boolean;

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

  @ManyToOne(
    () => Clients,
    (client) => client.clientSubscriptionPayments,
    { onDelete: 'CASCADE' },
  )
  @JoinColumn({ name: 'client_id' })
  client: Clients;

  @ManyToOne(
    () => Plans,
    (plan) => plan.clientSubscriptionPayments,
    { onDelete: 'CASCADE' },
  )
  @JoinColumn({ name: 'plan_id' })
  plan: Plans;

  @ManyToOne(
    () => PaymentMethods,
    (method) => method.clientSubscriptionPayments,
    { onDelete: 'CASCADE' },
  )
  @JoinColumn({ name: 'payment_method_id' })
  paymentMethod: PaymentMethods;

  @OneToMany(
    () => JobPlans,
    (jobPlan) => jobPlan.clientSubscriptionPayment,
  )
  jobPlans: JobPlans[];
}