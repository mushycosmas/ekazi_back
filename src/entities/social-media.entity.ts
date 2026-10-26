import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,
} from 'typeorm';

import { ClientSocialMedia } from 'src/client/entities/client-social-media.entity';

@Entity('social_media')
export class SocialMedia {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        type: 'varchar',
        length: 200,
    })
    media_name: string;

    @CreateDateColumn({
        type: 'timestamp',
        default: () => 'CURRENT_TIMESTAMP',
    })
    created_at: Date;

    @UpdateDateColumn({
        name: 'updatet_at',
        type: 'timestamp',
        default: () => 'CURRENT_TIMESTAMP',
        onUpdate: 'CURRENT_TIMESTAMP',
    })
    updatet_at: Date;

    @OneToMany(
        () => ClientSocialMedia,
        (clientSocialMedia) => clientSocialMedia.social,
    )
    clientSocialMedia: ClientSocialMedia[];
}