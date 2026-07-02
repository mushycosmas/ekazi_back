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

@Entity('client_phones')
export class ClientPhone {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'int', unsigned: true })
    client_id: number;

    @Column({ type: 'varchar', length: 100, nullable: true })
    phone_number: string;

    @Column({ type: 'varchar', length: 50, nullable: true })
    fax: string;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    // Relation
    @ManyToOne(() => Clients, (client) => client.phones, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'client_id' })
    client: Clients;
}