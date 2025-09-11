import { IsOptional, IsString } from 'class-validator';

export class ProfileDto {
  @IsString()
  @IsOptional()
  full_name?: string;

  @IsString()
  avatar_url: string;

  @IsOptional()
  @IsString()
  bio?: string;
}
