import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,
} from 'typeorm';
import { ApplicantApplication } from './applicants/applicant-applicantions.entity';
import { JobStage } from 'src/jobs/entities/job-stage.entity';

@Entity('stages')
export class Stage {
    @PrimaryGeneratedColumn({
        type: 'int',
        unsigned: true,
    })
    id: number;

    @Column({
        type: 'int',
        nullable: true,
    })
    stage_number: number;

    @Column({
        type: 'varchar',
        length: 50,
    })
    stage_code: string;

    @Column({
        type: 'varchar',
        length: 100,
    })
    stage_name: string;

    @Column({
        type: 'tinyint',
        default: 0,
    })
    hide: boolean;

    @CreateDateColumn({
        type: 'timestamp',
    })
    created_at: Date;

    @UpdateDateColumn({
        type: 'timestamp',
    })
    updated_at: Date;

    @Column({
        type: 'int',
    })
    creator_id: number;

    @Column({
        type: 'int',
    })
    updator_id: number;

    @OneToMany(
        () => ApplicantApplication,
        (application) => application.stage,
    )
    applications: ApplicantApplication[];

    @OneToMany(() => JobStage, (jobStage) => jobStage.stage)
    jobStages: JobStage[];
}