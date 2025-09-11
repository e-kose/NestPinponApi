import { IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateProfileDto {
  @IsString()
  @IsOptional()
  full_name?: string;

  @IsString()
  @IsOptional()
  avatar_url: string;

  @IsOptional()
  @IsString()
  bio?: string;
}

export class updateUserDto {
  @IsString()
  @IsOptional()
  username?: string;

  @IsString()
  @IsOptional()
  email?: string;

  @ValidateNested()
  @Type(() => UpdateProfileDto)
  @IsOptional()
  profile?: UpdateProfileDto;
}
