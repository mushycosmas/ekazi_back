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

@Entity('client_emails')
export class ClientEmail {
    @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
    id: number;

    @Column({ type: 'int', unsigned: true })
    client_id: number;

    @Column({ type: 'varchar', length: 100 })
    client_email: string;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    // RELATION
    @ManyToOne(() => Clients, (client) => client.emails, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'client_id' })
    client: Clients;
}