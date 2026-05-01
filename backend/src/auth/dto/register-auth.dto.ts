import { ApiProperty } from '@nestjs/swagger';

export class RegisterAuthDto {
  @ApiProperty({ example: 'alice@example.com' })
  email: string;

  @ApiProperty({ example: 'StrongPassword123' })
  password: string;

  @ApiProperty({ example: 'Alice Martin' })
  name: string;
}
