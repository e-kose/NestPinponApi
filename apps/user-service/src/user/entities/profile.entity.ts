import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';
import { DateClass } from './dateColumn';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class Profile extends DateClass {
  @PrimaryGeneratedColumn()
  @ApiProperty({ example: 1 })
  id: number;

  @OneToOne(() => User, (user) => user.profile, { cascade: true })
  @JoinColumn()
  user: User;

  @Column({ nullable: true })
  @ApiProperty({ example: 'Ertuğrul Köse' })
  full_name: string;

  @Column()
  @ApiProperty({ example: 'http:....' })
  avatar_url: string;

  @Column({ nullable: true })
  @ApiProperty({ example: 'bio' })
  bio: string;
}
