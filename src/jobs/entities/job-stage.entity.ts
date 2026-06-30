import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,
} from 'typeorm';

import { ApplicantApplication } from 'src/entities/applicants/applicant-applicantions.entity';

@Entity('stages')
export class JobStage {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'int', nullable: true })
    stage_number: number;

    @Column({ type: 'varchar', length: 50 })
    stage_code: string;

    @Column({ type: 'varchar', length: 100 })
    stage_name: string;

    @Column({ type: 'tinyint', default: 0 })
    hide: boolean;

    @CreateDateColumn({ 
        type: 'timestamp',
        nullable: true,
        default: () => 'CURRENT_TIMESTAMP'
    })
    created_at: Date;

    @UpdateDateColumn({ 
        type: 'timestamp',
        nullable: true,
        default: () => 'CURRENT_TIMESTAMP',
        onUpdate: 'CURRENT_TIMESTAMP'
    })
    updated_at: Date;

    @Column({ type: 'int' })
    creator_id: number;

    @Column({ type: 'int' })
    updator_id: number;

    @OneToMany(() => ApplicantApplication, (app) => app.stage)
    applications: ApplicantApplication[];
}