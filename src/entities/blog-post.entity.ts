import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    Index,
} from 'typeorm';

export enum BlogPostStatus {
    DRAFT = 'draft',
    PUBLISHED = 'published',
    ARCHIVED = 'archived',
}

@Entity('articles')
export class BlogPost {
    @PrimaryGeneratedColumn({
        type: 'bigint',
        unsigned: true,
    })
    id: string;

    @Column({ type: 'varchar', length: 255 })
    title: string;

    @Index({ unique: true })
    @Column({ type: 'varchar', length: 255 })
    slug: string;

    @Column({ type: 'text', nullable: true })
    excerpt: string | null;

    @Column({ type: 'longtext' })
    content: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    featured_image: string | null;

    @Column({
        type: 'enum',
        enum: BlogPostStatus,
        nullable: true,
        default: BlogPostStatus.DRAFT,
    })
    status: BlogPostStatus | null;

    @Column({ type: 'datetime', nullable: true })
    published_at: Date | null;

    @Column({ type: 'bigint', unsigned: true })
    author_id: string;

    @Column({
        type: 'bigint',
        unsigned: true,
        nullable: true,
        default: 0,
    })
    views: string | null;

    @CreateDateColumn({
        type: 'timestamp',
        default: () => 'CURRENT_TIMESTAMP',
    })
    created_at: Date;

    @UpdateDateColumn({
        type: 'timestamp',
        default: () => 'CURRENT_TIMESTAMP',
        onUpdate: 'CURRENT_TIMESTAMP',
    })
    updated_at: Date;
}