import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
} from 'typeorm';

import { ClientSubscriptionPayments } from 'src/client/client-subscription-payments.entity';

@Entity('payment_methods')
export class PaymentMethods {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({ length: 100 })
  payment_method: string;

  @Column({ length: 100 })
  font_awesome: string;

  @Column({ length: 100 })
  font_awesome_color: string;

  @Column()
  creator_id: number;

  @Column()
  updator_id: number;

  @Column({ type: 'boolean', default: false })
  hide: boolean;

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
    () => ClientSubscriptionPayments,
    (payment) => payment.paymentMethod,
  )
  clientSubscriptionPayments: ClientSubscriptionPayments[];
}