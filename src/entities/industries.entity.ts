// src/entities/applicants/industries.entity.ts
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
} from 'typeorm';
import { ApplicantPositions } from './applicants/applicant-positions.entity';
import { Jobs } from 'src/jobs/entities/job.entity';
// import { ArticleIndustry } from './article-industry.entity';

@Entity('industries')
export class Industries {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({ type: 'int', unsigned: true, nullable: true })
  creator_id: number | null;

  @Column({ type: 'int', unsigned: true, nullable: true })
  updator_id: number | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  industry_name: string | null;

  @Column({ type: 'varchar', length: 200, nullable: true })
  slug: string | null;

  @Column({ type: 'boolean', default: false })
  hide: boolean;

  @Column({ type: 'datetime', nullable: true })
  created_at: Date | null;

  @Column({ type: 'datetime', nullable: true })
  updated_at: Date | null;

  // ---------------------
  // Reverse relations
  // ---------------------
  //   @OneToMany(() => ArticleIndustry, (ai) => ai.industry)
  //   article_industry: ArticleIndustry[];

  @OneToMany(() => ApplicantPositions, (ap) => ap.industry)
  applicant_positions: ApplicantPositions[];
  
  @OneToMany(() => Jobs, (job) => job.industry)
  jobs: Jobs[];
}