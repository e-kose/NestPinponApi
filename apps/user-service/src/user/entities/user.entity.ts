import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { DateClass } from './dateColumn';
import { Profile } from './profile.entity';
import { Exclude } from 'class-transformer';

@Entity()
export class User extends DateClass {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  username: string;

  @Column()
  email: string;

  @Column()
  @Exclude()
  password: string;

  @Column({ default: false })
  is_2fa_enabled: boolean;

  @OneToOne(() => Profile, (profile) => profile.user, {
    cascade: ['soft-remove'],
  })
  profile: Profile;
}
