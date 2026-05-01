import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, TaskStatus } from '@prisma/client';
import { DatabaseService } from '../database/database.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

type FindAllTasksQuery = {
  status?: TaskStatus;
  from?: string;
  to?: string;
  search?: string;
  page?: string;
  limit?: string;
};

@Injectable()
export class TasksService {
  constructor(private readonly database: DatabaseService) {}

  async create(createTaskDto: CreateTaskDto, userId: number) {
    const user = await this.database.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`User #${userId} not found`);
    }

    return this.database.task.create({
      data: {
        ...createTaskDto,
        userId,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });
  }

  async findAll(query: FindAllTasksQuery = {}) {
    const { status, from, to, search } = query;
    const { page, limit, skip } = this.getPagination(query.page, query.limit);

    if (status && !Object.values(TaskStatus).includes(status)) {
      throw new BadRequestException(
        `Invalid status. Use one of: ${Object.values(TaskStatus).join(', ')}`,
      );
    }

    const where: Prisma.TaskWhereInput = {};

    if (status) {
      where.status = status;
    }

    if (from || to) {
      where.createdAt = {};

      if (from) {
        where.createdAt.gte = this.parseDate(from, 'from');
      }

      if (to) {
        where.createdAt.lte = this.parseDate(to, 'to', true);
      }
    }

    const normalizedSearch = search?.trim();
    if (normalizedSearch) {
      where.user = {
        OR: [
          { name: { contains: normalizedSearch, mode: 'insensitive' } },
          { email: { contains: normalizedSearch, mode: 'insensitive' } },
        ],
      };
    }

    const [data, total] = await Promise.all([
      this.database.task.findMany({
        where,
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
        },
        orderBy: { id: 'asc' },
      }),
      this.database.task.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number) {
    const task = await this.database.task.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });

    if (!task) {
      throw new NotFoundException(`Task #${id} not found`);
    }

    return task;
  }

  async update(id: number, updateTaskDto: UpdateTaskDto) {
    await this.findOne(id);

    return this.database.task.update({
      where: { id },
      data: updateTaskDto,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    return this.database.task.delete({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });
  }

  private getPagination(page?: string, limit?: string) {
    const parsedPage = Number(page ?? 1);
    const parsedLimit = Number(limit ?? 10);

    if (!Number.isInteger(parsedPage) || parsedPage < 1) {
      throw new BadRequestException('page must be a positive integer');
    }

    if (
      !Number.isInteger(parsedLimit) ||
      parsedLimit < 1 ||
      parsedLimit > 100
    ) {
      throw new BadRequestException('limit must be between 1 and 100');
    }

    return {
      page: parsedPage,
      limit: parsedLimit,
      skip: (parsedPage - 1) * parsedLimit,
    };
  }

  private parseDate(value: string, field: string, endOfDay = false) {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      throw new BadRequestException(`${field} must be a valid date`);
    }

    if (endOfDay && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
      date.setHours(23, 59, 59, 999);
    }

    return date;
  }
}
