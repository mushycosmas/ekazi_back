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

@Entity('client_descriptions')
export class ClientDescription {
    @PrimaryGeneratedColumn({
        unsigned: true,
    })
    id: number;

    @Column({
        type: 'int',
        unsigned: true,
    })
    client_id: number;

    @Column({
        type: 'varchar',
        length: 150,
    })
    website: string;

    @Column({
        type: 'text',
        nullable: true,
    })
    description: string;

    @Column({
        type: 'varchar',
        length: 200,
        nullable: true,
    })
    attachment: string;

    @CreateDateColumn({
        type: 'timestamp',
    })
    created_at: Date;

    @UpdateDateColumn({
        type: 'timestamp',
    })
    updated_at: Date;

    // Relationship
    @ManyToOne(() => Clients, (client) => client.descriptions, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'client_id' })
    client: Clients;
}