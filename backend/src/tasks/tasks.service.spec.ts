import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { TaskStatus } from '@prisma/client';
import { DatabaseService } from '../database/database.service';
import { TasksService } from './tasks.service';

describe('TasksService', () => {
  let service: TasksService;
  let database: {
    task: {
      findUnique: jest.Mock;
      findMany: jest.Mock;
      count: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
    user: {
      findUnique: jest.Mock;
    };
  };

  beforeEach(async () => {
    database = {
      task: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      user: {
        findUnique: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        {
          provide: DatabaseService,
          useValue: database,
        },
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('creates a task for an existing user', async () => {
    const task = {
      id: 1,
      title: 'Prepare demo',
      description: 'Test API routes',
      status: TaskStatus.PENDING,
      userId: 7,
    };

    database.user.findUnique.mockResolvedValue({ id: 7 });
    database.task.create.mockResolvedValue(task);

    await expect(
      service.create(
        {
          title: 'Prepare demo',
          description: 'Test API routes',
          status: TaskStatus.PENDING,
        },
        7,
      ),
    ).resolves.toEqual(task);

    expect(database.user.findUnique).toHaveBeenCalledWith({
      where: { id: 7 },
    });
    expect(database.task.create).toHaveBeenCalledWith({
      data: {
        title: 'Prepare demo',
        description: 'Test API routes',
        status: TaskStatus.PENDING,
        userId: 7,
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
  });

  it('throws when creating a task for an unknown user', async () => {
    database.user.findUnique.mockResolvedValue(null);

    await expect(
      service.create(
        {
          title: 'Prepare demo',
          description: 'Test API routes',
        },
        99,
      ),
    ).rejects.toThrow(NotFoundException);

    expect(database.task.create).not.toHaveBeenCalled();
  });

  it('finds tasks with filters, search, and pagination metadata', async () => {
    const data = [{ id: 1, title: 'Prepare demo' }];

    database.task.findMany.mockResolvedValue(data);
    database.task.count.mockResolvedValue(11);

    await expect(
      service.findAll({
        status: TaskStatus.COMPLETED,
        from: '2026-01-01',
        to: '2026-01-31',
        search: ' alice ',
        page: '2',
        limit: '5',
      }),
    ).resolves.toEqual({
      data,
      meta: {
        total: 11,
        page: 2,
        limit: 5,
        totalPages: 3,
      },
    });

    expect(database.task.findMany).toHaveBeenCalledWith({
      where: {
        status: TaskStatus.COMPLETED,
        createdAt: {
          gte: expect.any(Date),
          lte: expect.any(Date),
        },
        user: {
          OR: [
            { name: { contains: 'alice', mode: 'insensitive' } },
            { email: { contains: 'alice', mode: 'insensitive' } },
          ],
        },
      },
      skip: 5,
      take: 5,
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
    });
  });

  it('rejects invalid task query values', async () => {
    await expect(
      service.findAll({ status: 'INVALID' as TaskStatus }),
    ).rejects.toThrow(BadRequestException);

    await expect(service.findAll({ page: '0' })).rejects.toThrow(
      BadRequestException,
    );

    await expect(service.findAll({ limit: '101' })).rejects.toThrow(
      BadRequestException,
    );

    await expect(service.findAll({ from: 'not-a-date' })).rejects.toThrow(
      BadRequestException,
    );

    expect(database.task.findMany).not.toHaveBeenCalled();
  });

  it('updates an existing task', async () => {
    database.task.findUnique.mockResolvedValue({ id: 1 });
    database.task.update.mockResolvedValue({
      id: 1,
      title: 'Updated title',
    });

    await expect(service.update(1, { title: 'Updated title' })).resolves.toEqual(
      {
        id: 1,
        title: 'Updated title',
      },
    );

    expect(database.task.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { title: 'Updated title' },
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
  });
});
