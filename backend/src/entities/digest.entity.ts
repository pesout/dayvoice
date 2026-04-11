import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('digests')
export class Digest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @ManyToOne(() => User, (u) => u.digests)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'date' })
  date: string;

  @Column()
  dayName: string;

  @Column({ type: 'text' })
  summary: string;

  @Column({ type: 'json', nullable: true })
  todos: { id: string; text: string }[];

  @Column({ type: 'json', nullable: true })
  recordingIds: string[];

  @CreateDateColumn()
  createdAt: Date;
}
