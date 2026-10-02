import {
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';

@Entity('applicant_job_offers')
export class ApplicantJobOffer {
    @PrimaryGeneratedColumn({
        type: 'int',
    })
    id: number;

    @Column({
        type: 'int',
        nullable: true,
    })
    creator_id: number | null;

    @Column({
        type: 'int',
        nullable: true,
    })
    updator_id: number | null;

    @Column({
        type: 'int',
    })
    applicant_id: number;

    @Column({
        type: 'int',
    })
    job_id: number;

    @Column({
        type: 'int',
    })
    stage_id: number;

    @Column({
        type: 'int',
    })
    job_stage_id: number;

    @Column({
        type: 'int',
    })
    round: number;

    @Column({
        type: 'varchar',
        length: 100,
    })
    duration: string;

    @Column({
        type: 'date',
    })
    starting_date: Date;

    @Column({
        type: 'varchar',
        length: 100,
    })
    working_day: string;

    @Column({
        type: 'varchar',
        length: 100,
    })
    working_hour: string;

    @Column({
        type: 'varchar',
        length: 100,
    })
    probabition: string;

    @Column({
        type: 'double',
    })
    salary: number;

    @Column({
        type: 'text',
    })
    description: string;

    @Column({
        type: 'int',
    })
    recruitment_region_id: number;

    @Column({
        type: 'varchar',
        length: 100,
    })
    recruitment_sub_location: string;

    @Column({
        type: 'int',
    })
    working_region_id: number;

    @Column({
        type: 'varchar',
        length: 100,
    })
    working_sub_location: string;

    @Column({
        type: 'enum',
        enum: [
            'Pending',
            'Accepted',
            'Rejected',
            'Negotiable',
        ],
        default: 'Pending',
    })
    status: string;

    @Column({
        type: 'text',
        nullable: true,
    })
    reason: string | null;

    @Column({
        type: 'date',
        nullable: true,
    })
    deadline: Date | null;

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
}