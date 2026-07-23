import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';


@Entity('interview_panel_comments')
export class InterviewPanelComment {


    @PrimaryGeneratedColumn()
    id: number;



    @Column({
        type: 'int',
    })
    client_staff_id: number;



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
    round_id: number;



    @Column({
        type: 'double',
    })
    rate: number;



    @Column({
        type: 'text',
    })
    comment: string;



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
        nullable:true,
    })
    creator_id: number;



    @Column({
        type: 'int',
        nullable:true,
    })
    updator_id: number;


}