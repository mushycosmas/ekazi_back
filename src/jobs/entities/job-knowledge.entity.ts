import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
} from 'typeorm';


import { Jobs } from './job.entity';
import { Knowledge } from 'src/entities/knowledge.entity';

@Entity('job_knowledge')
export class JobKnowledge {
    @PrimaryGeneratedColumn({ unsigned: true })
    id: number;

    @Column({ unsigned: true })
    job_id: number;

    @Column({ unsigned: true })
    knowledge_id: number;

    @Column({
        type: 'timestamp',
        nullable: true,
    })
    created_at: Date | null;

    @Column({
        type: 'timestamp',
        nullable: true,
    })
    updated_at: Date | null;

    // ======================
    // Relations
    // ======================

    @ManyToOne(
        () => Jobs,
        (job) => job.jobKnowledge,
        {
            onDelete: 'CASCADE',
        },
    )
    @JoinColumn({ name: 'job_id' })
    job: Jobs;

    @ManyToOne(() => Knowledge, (knowledge) => knowledge.jobKnowledge, { onDelete: 'CASCADE', },)
    @JoinColumn({ name: 'knowledge_id' })
    knowledge: Knowledge;
}