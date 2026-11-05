import { Jobs } from 'src/jobs/entities/job.entity';
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,
} from 'typeorm';

// import { Positions } from './positions.entity';

@Entity('job_categories')
export class PositionCategories {
    @PrimaryGeneratedColumn({ unsigned: true })
    id: number;

    @Column({
        type: 'varchar',
        length: 150,
        unique: true,
    })
    name: string;

    @Column({
        type: 'text',
        nullable: true,
    })
    description: string | null;

    @Column({
        type: 'tinyint',
        default: 0,
    })
    hide: number;

    @CreateDateColumn({
        type: 'timestamp',
        name: 'created_at',
    })
    created_at: Date;

    @UpdateDateColumn({
        type: 'timestamp',
        name: 'updated_at',
    })
    updated_at: Date;

    // @OneToMany(() => Positions, (position) => position.category)
    // positions: Positions[];

     @OneToMany(() => Jobs, (job) => job.jobCategory)
    jobs: Jobs[];
}