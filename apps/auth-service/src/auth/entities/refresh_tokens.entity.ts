import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { AuthTable } from './auth.entity';
import { DateClass } from './date.class';

@Entity()
export class RefreshToken extends DateClass {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => AuthTable, (authTable) => authTable.id)
  @JoinColumn()
  user_id: AuthTable;

  @Column()
  token: string;
}
