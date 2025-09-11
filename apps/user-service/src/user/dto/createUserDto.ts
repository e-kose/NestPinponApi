import {
  IsEmail,
  IsString,
  IsStrongPassword,
  ValidateNested,
} from 'class-validator';
import { ProfileDto } from './profile.dto';
import { Type } from 'class-transformer';

export class CreateUserDto {
  @IsString()
  username: string;

  @IsEmail()
  email: string;

  @IsStrongPassword()
  password: string;

  @ValidateNested()
  @Type(() => ProfileDto)
  profile: ProfileDto;
}
