import { ApiProperty } from '@nestjs/swagger';

export class LoginAuthDto {
  @ApiProperty({ example: 'alice@example.com' })
  email: string;

  @ApiProperty({ example: 'StrongPassword123' })
  password: string;
}
