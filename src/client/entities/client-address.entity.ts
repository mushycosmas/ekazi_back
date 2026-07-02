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
import { Regions } from 'src/entities/regions.entity';

@Entity('client_addresses')
export class ClientAddress {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  sub_location: string;

  @Column({ type: 'text', nullable: true })
  location_notes: string;

  @Column({ type: 'text', nullable: true })
  company_profile: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  website: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  extra_communication: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  //REALTION TABLE
   // FK: client_id
  @Column()
  client_id: number;

  @ManyToOne(() => Clients, (client) => client.addresses, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'client_id' })
  client: Clients;

  // FK: region_id
  @Column()
  region_id: number;

  @ManyToOne(() => Regions, (region) => region.clientAddresses, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'region_id' })
  region: Regions;
}