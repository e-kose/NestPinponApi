import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsString, ValidateNested } from 'class-validator';

export const AvatarApiBody = {
  schema: {
    type: 'object',
    properties: {
      avatar: {
        type: 'string',
        format: 'binary',
        description: 'Yüklenecek avatar dosyası',
      },
    },
  },
};

export class UpdatePasswordDto {
  @ApiProperty({ example: '12345' })
  @IsString()
  oldPass: string;

  @ApiProperty({ example: '12345' })
  @IsString()
  newPass: string;
}

export class UpdateProfileDto {
  @IsString()
  @IsOptional()
  @ApiProperty({ example: 'Ertuğrul Köse' })
  full_name?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ example: 'http:.....' })
  avatar_url: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ example: 'bio' })
  bio?: string;
}

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  @ApiProperty({ example: 'ertu' })
  username?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ example: 'ertu@gmail.com' })
  email?: string;

  @ValidateNested()
  @ApiProperty()
  @Type(() => UpdateProfileDto)
  @IsOptional()
  profile?: UpdateProfileDto;
}
