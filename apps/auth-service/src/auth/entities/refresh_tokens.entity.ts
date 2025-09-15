import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { AuthTable } from './auth.entity';
import { DateClass } from './date.class';
import { IsOptional } from 'class-validator';

@Entity()
export class RefreshToken extends DateClass {
  @PrimaryGeneratedColumn()
  id: number;
  
  @Column()
  user_id: number;

  @OneToOne(() => AuthTable)
  @JoinColumn({name: 'user_id'})
  user: AuthTable;

  @Column()
  @IsOptional()
  token: string;
}
