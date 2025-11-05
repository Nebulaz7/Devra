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
  encryption: any;

  @Column('jsonb')
  verification: any;

  @Column({ nullable: true })
  cidHash: string;

  @Column({ nullable: true })
  ipfsUrl: string;

  @Column({ default: 'pending' })
  status: string;

  @Column({ type: 'timestamp', nullable: true })
  createdAt: Date;
}
