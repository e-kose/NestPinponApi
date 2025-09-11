import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';
import { DateClass } from './dateColumn';

@Entity()
export class Profile extends DateClass {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => User, (user) => user.profile, { cascade: true })
  @JoinColumn()
  user: User;

  @Column({ nullable: true })
  full_name: string;

  @Column()
  avatar_url: string;
  @Column({ nullable: true })
  bio: string;
}
