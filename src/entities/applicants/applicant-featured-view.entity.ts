import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('applicant_featured_views')
export class ApplicantFeaturedView {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ type: 'int' })
  applicant_id: number;

  @Column({ type: 'int', default: 0 })
  view_number: number;

  @Column({
    type: 'int',
    nullable: true,
    default: null,
  })
  like_number: number | null;

  @CreateDateColumn({
    type: 'timestamp',
    nullable: true,
    default: null,
  })
  created_at: Date | null;

  @UpdateDateColumn({
    type: 'timestamp',
    nullable: true,
    default: null,
  })
  updated_at: Date | null;
}