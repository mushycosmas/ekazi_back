import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';


@Entity('interview_stage_rounds')
export class InterviewStageRound {


    @PrimaryGeneratedColumn()
    id: number;



    @Column({
        type:'int',
        nullable:true,
    })
    creator_id: number;



    @Column({
        type:'int',
        nullable:true,
    })
    updator_id: number;



    @Column({
        type:'int',
    })
    job_stage_id: number;



    @Column({
        type:'int',
    })
    applicant_id: number;



    @Column({
        type:'int',
    })
    job_id: number;



    @Column({
        type:'int',
    })
    round: number;



    @CreateDateColumn({
        type:'timestamp',
    })
    created_at: Date;



    @UpdateDateColumn({
        type:'timestamp',
    })
    updated_at: Date;

}