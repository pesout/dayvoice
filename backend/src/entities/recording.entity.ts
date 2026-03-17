import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('recordings')
export class Recording {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @ManyToOne(() => User, (u) => u.recordings)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  audioPath: string;

  @Column({ type: 'text', default: '' })
  transcript: string;

  @Column({ type: 'text', default: '' })
  summary: string;

  @Column({ type: 'json', default: '[]' })
  todos: { id: string; text: string }[];

  @Column({ default: 0 })
  durationSeconds: number;

  @CreateDateColumn()
  createdAt: Date;
}
