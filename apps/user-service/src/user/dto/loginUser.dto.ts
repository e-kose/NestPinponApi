import { IsEmail, IsOptional, IsString } from 'class-validator';

export class LoginUserDto {
  @IsString()
  @IsOptional()
  username?: string;

  @IsString()
  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  password: string;
}
