import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { Recording } from './recording.entity';
import { Digest } from './digest.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  passwordHash: string;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => Recording, (r) => r.user)
  recordings: Recording[];

  @OneToMany(() => Digest, (d) => d.user)
  digests: Digest[];
}
