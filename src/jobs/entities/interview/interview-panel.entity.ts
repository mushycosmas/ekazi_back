import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';


import { Users } from 'src/entities/users.entity';
import { Applicants } from 'src/entities/applicants/applicants.entity';
import { Jobs } from '../job.entity';
import { ClientStaff } from 'src/client/entities/client-staff.entity';


@Entity('interview_panel')
export class InterviewPanel {

    @PrimaryGeneratedColumn()
    id: number;


    @Column()
    client_staff_id: number;


    @Column()
    job_id: number;


    @Column()
    applicant_id: number;


    @Column({
        nullable: true,
    })
    creator_id: number;


    @Column({
        nullable: true,
    })
    updator_id: number;


    @CreateDateColumn({
        type: 'timestamp',
    })
    created_at: Date;


    @UpdateDateColumn({
        type: 'timestamp',
    })
    updated_at: Date;



    // ======================
    // Relations
    // ======================


    @ManyToOne(() => ClientStaff)
    @JoinColumn({ name: 'client_staff_id' })
    clientStaff: ClientStaff;



    @ManyToOne(() => Jobs)
    @JoinColumn({ name: 'job_id' })
    job: Jobs;



    @ManyToOne(() => Applicants)
    @JoinColumn({ name: 'applicant_id' })
    applicant: Applicants;



    @ManyToOne(() => Users)
    @JoinColumn({ name: 'creator_id' })
    creator: Users;


    @ManyToOne(() => Users)
    @JoinColumn({ name: 'updator_id' })
    updator: Users;

}