import { ApiProperty } from '@nestjs/swagger';
import { User } from 'src/user/entities/user.entity';

export class getUserDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty()
  user: User;
}
