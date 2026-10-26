import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { Clients } from '../clients.entity';
import { SocialMedia } from 'src/entities/social-media.entity';

@Entity('client_social_media')
export class ClientSocialMedia {
    @PrimaryGeneratedColumn({
        type: 'int',
        unsigned: true,
    })
    id: number;

    @Column({
        type: 'int',
        unsigned: true,
    })
    client_id: number;

    @Column({
        type: 'int',
        unsigned: true,
    })
    social_id: number;

    @Column({
        type: 'varchar',
        length: 200,
        nullable: true,
    })
    url_media: string | null;

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

      // Relationship with clients
    @ManyToOne(() => Clients, (client) => client.socialMedia)
    @JoinColumn({ name: 'client_id' })
    client: Clients;

    // Relationship with social_media
    @ManyToOne(() => SocialMedia)
    @JoinColumn({ name: 'social_id' })
    social: SocialMedia;
}