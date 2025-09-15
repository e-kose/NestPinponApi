import { ApiProperty } from '@nestjs/swagger';

export class UpdateAvatarDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'http...' })
  avatar_url: string;
}
