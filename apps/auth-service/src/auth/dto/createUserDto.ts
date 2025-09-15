import {
  IsEmail,
  IsString,
  IsStrongPassword,
  ValidateNested,
} from 'class-validator';
import { ProfileDto } from './profile.dto';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @IsString()
  @ApiProperty({ example: 'ertu', description: 'Kullanıcı adı' })
  username: string;

  @IsEmail()
  @ApiProperty({ example: 'ertu@gmail.com', description: 'Mail adresi' })
  email: string;

  @IsStrongPassword()
  @ApiProperty({ example: '123456erT.', description: 'Kullanıcı şifresi' })
  password: string;

  @ValidateNested()
  @ApiProperty({ type: ProfileDto })
  @Type(() => ProfileDto)
  profile: ProfileDto;
}
