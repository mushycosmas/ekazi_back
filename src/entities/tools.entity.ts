// src/entities/tools.entity.ts
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
} from 'typeorm';
import { ApplicantTools } from './applicants/applicant-tools.entity';
import { JobTool } from 'src/jobs/entities/job-tool.entity';

@Entity('tools')
export class Tools {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({ type: 'varchar', length: 30 })
  tool_name: string;

  @Column({ type: 'int', default: 0 })
  hide: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;

  @Column({ type: 'int', unsigned: true })
  creator_id: number;

  @Column({ type: 'int', unsigned: true })
  updator_id: number;

  @Column({ type: 'timestamp', nullable: true })
  deleted_at: Date | null;

  // ----------------------
  // Reverse relation
  // ----------------------
  @OneToMany(() => ApplicantTools, (at) => at.tools)
  applicant_tools: ApplicantTools[];

  @OneToMany(() => JobTool, (jobTool) => jobTool.tool,)
  jobTools: JobTool[];
}