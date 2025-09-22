import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString } from 'class-validator';

export class LoginUserDto {
  @IsString()
  @IsOptional()
  @ApiProperty({ example: 'ertu', description: 'kullanıcı adı ile giriş' })
  username?: string;

  @IsString()
  @IsEmail()
  @IsOptional()
  @ApiProperty({ example: 'ertu@gmail.com', description: 'mail ile giriş' })
  email?: string;

  @IsString()
  @ApiProperty({ example: '123456erT.', description: 'Kullanıcı şifresi' })
  password: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ example: '1111', description: '2Fa token' })
  token?: string;
}
