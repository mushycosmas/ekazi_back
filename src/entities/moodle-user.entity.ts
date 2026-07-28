import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
} from 'typeorm';


@Entity('mdl_user')
export class MoodleUser {


    @PrimaryGeneratedColumn({
        type: 'bigint',
    })
    id: number;


    @Column({
        type: 'varchar',
        length: 20,
        default: 'manual',
    })
    auth: string;


    @Column({
        type: 'tinyint',
        default: 0,
    })
    confirmed: number;


    @Column({
        type: 'tinyint',
        default: 0,
    })
    policyagreed: number;


    @Column({
        type: 'tinyint',
        default: 0,
    })
    deleted: number;


    @Column({
        type: 'tinyint',
        default: 0,
    })
    suspended: number;


    @Column({
        type: 'bigint',
    })
    mnethostid: number;


    @Column({
        type: 'varchar',
        length: 100,
    })
    username: string;


    @Column({
        type: 'varchar',
        length: 255,
    })
    password: string;


    @Column({
        type: 'varchar',
        length: 255,
        default: '',
    })
    idnumber: string;


    @Column({
        type: 'varchar',
        length: 100,
    })
    firstname: string;


    @Column({
        type: 'varchar',
        length: 100,
    })
    lastname: string;


    @Column({
        type: 'varchar',
        length: 100,
    })
    email: string;


    @Column({
        type:'tinyint',
        default:0,
    })
    emailstop:number;


    @Column({
        type:'varchar',
        length:20,
        default:'',
    })
    phone1:string;


    @Column({
        type:'varchar',
        length:20,
        default:'',
    })
    phone2:string;


    @Column({
        type:'varchar',
        length:255,
        default:'',
    })
    institution:string;


    @Column({
        type:'varchar',
        length:255,
        default:'',
    })
    department:string;


    @Column({
        type:'varchar',
        length:255,
        default:'',
    })
    address:string;


    @Column({
        type:'varchar',
        length:120,
        default:'',
    })
    city:string;


    @Column({
        type:'varchar',
        length:2,
        default:'',
    })
    country:string;


    @Column({
        type:'varchar',
        length:30,
        default:'en',
    })
    lang:string;


    @Column({
        type:'varchar',
        length:30,
        default:'gregorian',
    })
    calendartype:string;


    @Column({
        type:'varchar',
        length:50,
        default:'',
    })
    theme:string;


    @Column({
        type:'varchar',
        length:100,
        default:'99',
    })
    timezone:string;


    @Column({
        type:'bigint',
        default:0,
    })
    firstaccess:number;


    @Column({
        type:'bigint',
        default:0,
    })
    lastaccess:number;


    @Column({
        type:'bigint',
        default:0,
    })
    lastlogin:number;


    @Column({
        type:'bigint',
        default:0,
    })
    currentlogin:number;


    @Column({
        type:'varchar',
        length:45,
        default:'',
    })
    lastip:string;


    @Column({
        type:'varchar',
        length:15,
        default:'',
    })
    secret:string;


    @Column({
        type:'bigint',
        default:0,
    })
    picture:number;


    @Column({
        type:'varchar',
        length:255,
        default:'',
    })
    url:string;


    @Column({
        type:'longtext',
        nullable:true,
    })
    description:string;


    @Column({
        type:'tinyint',
        default:1,
    })
    descriptionformat:number;


    @Column({
        type:'tinyint',
        default:1,
    })
    mailformat:number;


    @Column({
        type:'tinyint',
        default:0,
    })
    maildigest:number;


    @Column({
        type:'tinyint',
        default:2,
    })
    maildisplay:number;


    @Column({
        type:'tinyint',
        default:1,
    })
    autosubscribe:number;


    @Column({
        type:'tinyint',
        default:0,
    })
    trackforums:number;


    @Column({
        type:'bigint',
        default:0,
    })
    timecreated:number;


    @Column({
        type:'bigint',
        default:0,
    })
    timemodified:number;


    @Column({
        type:'bigint',
        default:0,
    })
    trustbitmask:number;


    @Column({
        type:'varchar',
        length:255,
        nullable:true,
    })
    imagealt:string;


    @Column({
        type:'varchar',
        length:255,
        nullable:true,
    })
    lastnamephonetic:string;


    @Column({
        type:'varchar',
        length:255,
        nullable:true,
    })
    firstnamephonetic:string;


    @Column({
        type:'varchar',
        length:255,
        nullable:true,
    })
    middlename:string;


    @Column({
        type:'varchar',
        length:255,
        nullable:true,
    })
    alternatename:string;


    @CreateDateColumn({
        type:'timestamp',
    })
    created_at:Date;

}