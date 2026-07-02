import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,
} from 'typeorm';


import { Clients } from '../clients.entity';

@Entity('client_types')
export class ClientType {
    @PrimaryGeneratedColumn({
        type: 'int',
        unsigned: true,
    })
    id: number;

    @Column({
        type: 'varchar',
        length: 100,
    })
    type_name: string;

    @CreateDateColumn({
        type: 'timestamp',
    })
    created_at: Date;

    @UpdateDateColumn({
        type: 'timestamp',
    })
    updated_at: Date;

    // RELATION: one client type can belong to many clients
    @OneToMany(() => Clients, (client) => client.type)
    clients: Clients[];
}