import { Column, Entity, PrimaryColumn } from 'typeorm';
import { DateClass } from './date.class';

@Entity()
export class AuthTable extends DateClass {
  @PrimaryColumn()
  user_id: number;

  @Column({ nullable: true })
  oauth_id: string;

  @Column({ default: false })
  twofa_enable: boolean;

  @Column({ nullable: true })
  twofa_secret: string;
}
