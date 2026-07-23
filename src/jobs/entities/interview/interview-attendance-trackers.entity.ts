import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';


@Entity('interview_attendance_trackers')
export class InterviewAttendenceTracker {


    @PrimaryGeneratedColumn()
    id: number;



    @Column({
        type: 'int',
    })
    job_id: number;



    @Column({
        type: 'int',
    })
    applicant_id: number;



    @Column({
        type: 'enum',
        enum: [
            'available',
            'not available',
            'reject',
            '',
        ],
    })
    status: string;



    @Column({
        type: 'text',
    })
    comments: string;



    @CreateDateColumn({
        type: 'timestamp',
    })
    created_at: Date;



    @UpdateDateColumn({
        type: 'timestamp',
    })
    updated_at: Date;


}