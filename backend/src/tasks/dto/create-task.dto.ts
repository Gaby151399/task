import { TaskStatus } from '@prisma/client';

export class CreateTaskDto {
  title: string;
  description: string;
  userId: number;
  status?: TaskStatus;
}
