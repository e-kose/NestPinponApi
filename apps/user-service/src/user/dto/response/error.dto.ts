import { ApiProperty } from '@nestjs/swagger';

export class ErrorDto {
  @ApiProperty({ example: false })
  success: boolean;

  @ApiProperty()
  message: string;
}
