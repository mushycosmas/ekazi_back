import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  ManyToMany,
  JoinTable,
  ManyToOne,
  JoinColumn // Add this import
} from 'typeorm';
import { Applicants } from './applicants/applicants.entity';
import { Role } from './role.entity';
import { Permission } from './permission.entity';
import { JobEvaluationAptitudes } from 'src/jobs/entities/job-evaluation-aptitudes.entity';
import { JobEvaluationGenerals } from 'src/jobs/entities/job-evaluation-generals.entity';
import { JobEvaluationSpecifics } from 'src/jobs/entities/job-evaluation-specifics.entity';
import { JobLikes } from 'src/jobs/entities/job-likes.entity';
import { JobServiceInfos } from 'src/jobs/entities/job-service-infos.entity';
import { JobShortListings } from 'src/jobs/entities/job-short-listings.entity';
import { JobStage } from 'src/jobs/entities/job-stage.entity';
import { Task } from 'src/tasks/entities/tasks.entity';
import { TaskAssignment } from 'src/tasks/entities/task-assignments.entity';

@Entity('users')
export class Users {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({ type: 'varchar', length: 200, nullable: true })
  provider: string | null;

  @Column({ type: 'text', nullable: true })
  provider_id: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  terms: string | null;

  @Column({ type: 'int', nullable: true })
  updator_id: number | null;

  @Column({ type: 'int', nullable: true })
  creator_id: number | null;

  @Column({ type: 'int', unsigned: true })
  role_id: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  username: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  email: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  password: string | null;

  @Column({ type: 'boolean', default: false })
  hide: boolean;

  // @Column({ type: 'boolean', nullable: true })
  // verified: boolean | null;
  // @Column({ default: 0 })
  // verified: number;
  // @Column({ type: 'int' })
  // verified: number;
  @Column({ type: 'int' })
  private _verified: number;

  set verified(value: number | boolean) {
    if (typeof value === 'boolean') {
      this._verified = value ? 1 : 0;
    } else {
      this._verified = value;
    }
  }

  get verified(): number {
    return this._verified;
  }

  @Column({ type: 'varchar', length: 100, nullable: true })
  verify_key: string | null;

  @Column({ type: 'timestamp', nullable: true })
  email_verified_at: Date | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  remember_token: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  temp_email: string | null;

  @Column({ type: 'datetime', nullable: true })
  created_at: Date | null;

  @Column({ type: 'datetime', nullable: true })
  updated_at: Date | null;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  password_changed_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  last_activity_at: Date | null;

  @Column({ type: 'int', nullable: true })
  client_id: number | null;

  // ----------------------
  // Relations
  // ----------------------

  @OneToMany(() => Applicants, (applicant) => applicant.user)
  applicants: Applicants[];

  // FIXED: Many-to-One relationship with Role
  @ManyToOne(() => Role, (role) => role.users)
  @JoinColumn({ name: 'role_id' })
  role: Role;

  @OneToMany(() => JobEvaluationAptitudes, (aptitude) => aptitude.user,)
  evaluationAptitudes: JobEvaluationAptitudes[];

  @OneToMany(() => JobEvaluationGenerals, (general) => general.user,)
  evaluationGenerals: JobEvaluationGenerals[];

  @OneToMany(() => JobEvaluationSpecifics, (specific) => specific.user,)
  evaluationSpecifics: JobEvaluationSpecifics[];

  @OneToMany(
    () => JobLikes,
    (jobLike) => jobLike.user,
  )
  jobLikes: JobLikes[];

  @OneToMany(() => JobServiceInfos, (jobServiceInfo) => jobServiceInfo.user,)
  jobServiceInfos: JobServiceInfos[];

  @OneToMany(() => JobShortListings, (shortListing) => shortListing.user,)
  jobShortListings: JobShortListings[];

  @OneToMany(() => JobStage, (jobStage) => jobStage.creator)
  createdJobStages: JobStage[];

  @OneToMany(() => JobStage, (jobStage) => jobStage.updator)
  updatedJobStages: JobStage[];

  @OneToMany(() => Task, (task) => task.creator)
  tasks: Task[];

  @OneToMany(() => TaskAssignment, (a) => a.user)
  taskAssignments: TaskAssignment[];
}