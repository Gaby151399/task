import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TaskStatus } from '@prisma/client';

export class CreateTaskDto {
  @ApiProperty({ example: 'Préparer la démo API' })
  title: string;

  @ApiProperty({ example: 'Tester les routes users et tasks depuis Swagger' })
  description: string;

  @ApiProperty({ example: 1 })
  userId: number;

  @ApiPropertyOptional({ enum: TaskStatus, example: TaskStatus.PENDING })
  status?: TaskStatus;
}
