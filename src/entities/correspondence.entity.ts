import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
    OneToMany,
} from 'typeorm';
import { CorrespondenceAttachment } from './correspondence-attachment.entity';
import { CorrespondenceThread } from './correspondence-thread.entity';



@Entity('correspondences')
export class Correspondence {
    @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
    id: number;

    // Keep for backward compatibility
    @Column({ type: 'int', nullable: false })
    applicant_id: number;

    @Column({ type: 'int', unsigned: true, nullable: true })
    thread_id: number | null;

    @Column({ type: 'int', unsigned: true, nullable: true })
    reply_to_id: number | null;

    @Column({
        type: 'enum',
        enum: ['admin', 'employer', 'applicant', 'system'],
    })
    sender_type: 'admin' | 'employer' | 'applicant' | 'system';

    @Column({
        type: 'tinyint',
        default: 0,
    })
    is_deleted: boolean;

    @Column({
        type: 'timestamp',
        nullable: true,
    })
    deleted_at: Date | null;

    @Column({ type: 'int', unsigned: true, nullable: true })
    sender_id: number | null;

    @Column({
        type: 'enum',
        enum: ['stage', 'interview', 'issue', 'note', 'general'],
    })
    category: 'stage' | 'interview' | 'issue' | 'note' | 'general';

    @Column({ type: 'varchar', length: 255, nullable: true })
    subject: string | null;

    @Column({ type: 'text' })
    message: string;

    @Column({ type: 'longtext', nullable: true })
    meta: string | null;

    @Column({ type: 'tinyint', default: 1, nullable: true })
    visible_to_applicant: boolean;

    @Column({ type: 'tinyint', default: 1, nullable: true })
    visible_to_employer: boolean;

    @Column({ type: 'tinyint', default: 0, nullable: true })
    is_read: boolean;

    @Column({
        type: 'enum',
        enum: ['accepted', 'rejected'],
        nullable: true,
    })
    status: 'accepted' | 'rejected' | null;

    @Column({ type: 'text', nullable: true })
    rejection_reason: string | null;

    @CreateDateColumn({ type: 'timestamp', nullable: true })
    created_at: Date;

    @UpdateDateColumn({ type: 'timestamp', nullable: true })
    updated_at: Date;

    @ManyToOne(
        () => CorrespondenceThread,
        (thread) => thread.messages,
        {
            onDelete: 'CASCADE',
            nullable: true,
        },
    )
    @JoinColumn({ name: 'thread_id' })
    thread: CorrespondenceThread | null;

    @OneToMany(
        () => CorrespondenceAttachment,
        (attachment) => attachment.correspondence,
    )
    attachments: CorrespondenceAttachment[];
}