import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class ProfileDto {
  @IsString()
  @IsOptional()
  @ApiProperty({ example: 'ertugrul kose', description: 'İsim ve soyisim' })
  full_name?: string;

  @IsString()
  @ApiProperty({ example: 'http.......', description: 'Profil ftoğrafı linki' })
  avatar_url: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ example: 'biyografi', description: 'Kullanıcı biyografisi' })
  bio?: string;
}
