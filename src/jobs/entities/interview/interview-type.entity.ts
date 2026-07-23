import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';


@Entity('interview_types')
export class InterviewType {


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
        type:'varchar',
        length:100,
    })
    name: string;



    @CreateDateColumn({
        type:'timestamp',
    })
    created_at: Date;



    @UpdateDateColumn({
        type:'timestamp',
    })
    updated_at: Date;


}