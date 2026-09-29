import {
    Column,
    CreateDateColumn,
    Entity,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';

// import { ApplicantJobBenefit } from './applicant-job-benefit.entity';

@Entity('benefits')
export class Benefit {
    @PrimaryGeneratedColumn({
        type: 'int',
        unsigned: true,
    })
    id: number;

    @Column({
        type: 'varchar',
        length: 100,
    })
    name: string;

    @CreateDateColumn({
        type: 'timestamp',
        default: () => 'CURRENT_TIMESTAMP',
    })
    created_at: Date;

    @UpdateDateColumn({
        type: 'timestamp',
        default: () => 'CURRENT_TIMESTAMP',
        onUpdate: 'CURRENT_TIMESTAMP',
    })
    updated_at: Date;

    @Column({
        type: 'int',
        unsigned: true,
    })
    creator_id: number;

    @Column({
        type: 'int',
        unsigned: true,
    })
    updator_id: number;

    // @OneToMany(
    //     () => ApplicantJobBenefit,
    //     applicantJobBenefit => applicantJobBenefit.benefit,
    // )
    // applicant_job_benefits: ApplicantJobBenefit[];
}