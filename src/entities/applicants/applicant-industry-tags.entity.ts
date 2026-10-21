import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
} from 'typeorm';

@Entity('applicant_tags')
@Index('IDX_applicant_industry_tags_applicant_id', ['applicant_id'])
@Index('IDX_applicant_industry_tags_industry_id', ['industry_id'])
export class ApplicantIndustryTags {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({ type: 'int', unsigned: true })
  applicant_id: number;

  @Column({ type: 'int', unsigned: true })
  industry_id: number;

  @Column({ type: 'varchar', length: 100 })
  tag_name: string;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  created_at: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  updated_at: Date;
}