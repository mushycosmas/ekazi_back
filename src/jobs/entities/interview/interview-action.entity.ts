import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';


@Entity('interview_actions')
export class InterviewAction {


    @PrimaryGeneratedColumn()
    id: number;



    @Column({
        type: 'varchar',
        length: 100,
    })
    name: string;



    @CreateDateColumn({
        type: 'timestamp',
    })
    created_at: Date;



    @UpdateDateColumn({
        type: 'timestamp',
    })
    updated_at: Date;


}