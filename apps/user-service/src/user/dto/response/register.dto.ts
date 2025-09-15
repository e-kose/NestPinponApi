import { ApiProperty } from '@nestjs/swagger';

export class RegisterResponseDto {
  @ApiProperty({ example: true })
  success: true;
  @ApiProperty({ example: 'User successfully created' })
  message: string;
  @ApiProperty({ example: 1 })
  userId: number;
}
