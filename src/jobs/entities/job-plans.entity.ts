import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

 
import { Jobs } from './job.entity';
import { Clients } from 'src/client/clients.entity';
import { Plans } from 'src/entities/plans.entity';
import { ClientSubscriptionPayments } from 'src/client/client-subscription-payments.entity';


@Entity('job_plans')
export class JobPlans {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  client_subscription_payment_id: number;

  @Column()
  client_id: number;

  @Column({ nullable: true })
  plan_id: number;

  @Column()
  job_id: number;

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

  // =====================
  // Relations
  // =====================

  @ManyToOne(
    () => Jobs,
    (job) => job.jobPlans,
    { onDelete: 'CASCADE' },
  )
  @JoinColumn({ name: 'job_id' })
  job: Jobs;

  @ManyToOne(
    () => Clients,
    (client) => client.jobPlans,
    { onDelete: 'CASCADE' },
  )
  @JoinColumn({ name: 'client_id' })
  client: Clients;

  @ManyToOne(
    () => Plans,
    (plan) => plan.jobPlans,
    { nullable: true, onDelete: 'SET NULL' },
  )
  @JoinColumn({ name: 'plan_id' })
  plan: Plans;

  @ManyToOne(
    () => ClientSubscriptionPayments,
    (payment) => payment.jobPlans,
    { nullable: true, onDelete: 'SET NULL' },
  )
  @JoinColumn({ name: 'client_subscription_payment_id' })
  clientSubscriptionPayment: ClientSubscriptionPayments;
}