import {
    Entity,
    PrimaryGeneratedColumn,
    ManyToOne,
    JoinColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';

import { Users } from './users.entity';
import { Permission } from './permission.entity';


@Entity('user_permissions')
export class UserPermission {

    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(
        () => Users,
        user => user.userPermissions,
        {
            onDelete: 'CASCADE',
        },
    )
    @JoinColumn({ name: 'user_id' })
    user: Users;


    @Column()
    user_id: number;



    @ManyToOne(
        () => Permission,
        permission => permission.userPermissions,
        {
            onDelete: 'CASCADE'
        }
    )
    @JoinColumn({
        name: 'permission_id'
    })
    permission: Permission;


    @Column()
    permission_id: number;



    /**
     * allow or deny
     * 
     * allow = give extra permission
     * deny  = remove permission from role
     */
    @Column({
        type: 'enum',
        enum: ['allow', 'deny'],
        default: 'allow'
    })
    type: 'allow' | 'deny';



    @CreateDateColumn()
    created_at: Date;


    @UpdateDateColumn()
    updated_at: Date;
}