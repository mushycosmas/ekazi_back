import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('payroll_reductions') // Replace with your actual table name
export class PayrollReduction {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ type: 'int' })
  payone_reduction: number;

  @Column({ type: 'int' })
  paytwo_reduction: number;

  @Column({ type: 'int' })
  paythree_reduction: number;

  @Column({ type: 'int' })
  payfour_reduction: number;

  @Column({ type: 'int' })
  paytwo_addition: number;

  @Column({ type: 'int' })
  paythree_addition: number;

  @Column({ type: 'int' })
  payfour_addition: number;

  @Column({ type: 'double' })
  payone_percentage: number;

  @Column({ type: 'double' })
  paytwo_percentage: number;

  @Column({ type: 'double' })
  paythree_percentage: number;

  @Column({ type: 'double' })
  payfour_percentage: number;

  @Column({ type: 'double' })
  insurance: number;

  @CreateDateColumn({
    type: 'datetime',
    default: () => 'CURRENT_TIMESTAMP',
  })
  created_at: Date;

  @UpdateDateColumn({
    type: 'datetime',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updated_at: Date;
}