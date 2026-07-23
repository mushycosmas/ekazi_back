 import { Clients } from 'src/client/clients.entity';
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';

@Entity('interview_participant_emails')
export class InterviewParticipantEmail {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    client_id: number;

    @Column({
        length: 255,
    })
    email: string;

    @Column({
        type: 'text',
        nullable: true,
    })
    online_link: string;

    @Column({
        nullable: true,
    })
    creator_id: number;

    @Column({
        nullable: true,
    })
    updator_id: number;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;


    @ManyToOne(() => Clients, client => client.interviewParticipantEmails, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'client_id' })
    client: Clients;
}