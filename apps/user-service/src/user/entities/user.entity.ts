import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { DateClass } from './dateColumn';
import { Profile } from './profile.entity';
import { Exclude } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class User extends DateClass {
  @PrimaryGeneratedColumn()
  @ApiProperty({ example: 1 })
  id: number;

  @Column()
  @ApiProperty({ example: 'ertu' })
  username: string;

  @Column()
  @ApiProperty({ example: 'ertu@gmail.com' })
  email: string;

  @Column()
  @Exclude()
  password: string;

  @Column({ default: false })
  @ApiProperty({ example: false })
  is_2fa_enabled: boolean;

  @OneToOne(() => Profile, (profile) => profile.user, {
    cascade: ['soft-remove'],
  })
  @ApiProperty()
  profile: Profile;
}
