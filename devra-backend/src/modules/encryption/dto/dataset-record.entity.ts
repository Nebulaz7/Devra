import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('datasets')
export class DatasetRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  owner: string;

  @Column()
  hash: string;

  @Column('jsonb')
  fileEncryption: any;

  @Column('jsonb')
  cidEncryption: any;

  @Column('jsonb')
  verification: any;

  @Column({ nullable: true })
  ipfsUrl: string;

  @Column({ default: 'pending' })
  status: string;

  @Column({ type: 'timestamp', nullable: true })
  createdAt: Date;
}
