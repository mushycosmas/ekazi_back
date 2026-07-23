import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';

import { Users } from 'src/entities/users.entity';
import { Clients } from '../clients.entity';


@Entity('client_staff')
export class ClientStaff {


    @PrimaryGeneratedColumn()
    id: number;
    @Column({
        type: 'int',
        unsigned: true,
    })
    prefix_id: number;

    @Column({
        type: 'int',
        unsigned: true,
    })
    client_id: number;

    @Column({
        type: 'int',
        unsigned: true,
        nullable: true,
    })
    user_id: number;

    @Column({
        type: 'int',
        unsigned: true,
    })
    creator_id: number;

    @Column({
        type: 'int',
        unsigned: true,
    })
    updator_id: number;

    @Column({
        type: 'varchar',
        length: 100,
    })
    first_name: string;

    @Column({
        type: 'varchar',
        length: 100,
    })
    middle_name: string;

    @Column({
        type: 'varchar',
        length: 100,
    })
    last_name: string;

    @Column({
        type: 'varchar',
        length: 100,
    })
    phone_number: string;

    @CreateDateColumn({
        type: 'timestamp',
    })
    created_at: Date;

    @UpdateDateColumn({
        type: 'timestamp',
    })
    updated_at: Date;

    // ============================
    // Relations
    // ============================

    @ManyToOne(
        () => Clients,
        client => client.staff,
        {
            onDelete:'CASCADE',
        }
    )
    @JoinColumn({
        name:'client_id',
    })
    client: Clients;

    @ManyToOne(
        () => Users,
        user => user.clientStaff,
        {
            nullable:true,
        }
    )
    @JoinColumn({
        name:'user_id',
    })
    user: Users;


}