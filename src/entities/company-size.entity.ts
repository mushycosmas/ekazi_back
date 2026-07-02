import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,
} from 'typeorm';

import { Clients } from 'src/client/clients.entity';

@Entity('company_sizes')
export class CompanySize {
    @PrimaryGeneratedColumn({
        type: 'int',
    })
    id: number;

    @Column({
        type: 'varchar',
        length: 30,
    })
    name: string;

    @Column({
        type: 'int',
        nullable: true,
    })
    status: number;

    @CreateDateColumn({
        type: 'timestamp',
    })
    created_at: Date;

    @UpdateDateColumn({
        type: 'timestamp',
    })
    updated_at: Date;

    // RELATION: one company size can belong to many clients
    @OneToMany(() => Clients, (client) => client.companySize)
    clients: Clients[];
}