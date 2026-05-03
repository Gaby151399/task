import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcryptjs';
import { DatabaseService } from '../database/database.service';
import { UsersService } from './users.service';

jest.mock('bcryptjs', () => ({
  hash: jest.fn(),
}));

describe('UsersService', () => {
  let service: UsersService;
  let database: {
    user: {
      findUnique: jest.Mock;
      findMany: jest.Mock;
      count: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
  };

  const bcryptMock = bcrypt as jest.Mocked<typeof bcrypt>;

  beforeEach(async () => {
    database = {
      user: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: DatabaseService,
          useValue: database,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('creates a user with normalized email and hashed password', async () => {
    const user = {
      id: 1,
      email: 'alice@example.com',
      name: 'Alice',
      tasks: [],
    };

    database.user.findUnique.mockResolvedValue(null);
    database.user.create.mockResolvedValue(user);
    bcryptMock.hash.mockResolvedValue('hashed-password' as never);

    await expect(
      service.create({
        email: ' Alice@Example.com ',
        password: 'StrongPassword123',
        name: 'Alice',
      }),
    ).resolves.toEqual(user);

    expect(database.user.findUnique).toHaveBeenCalledWith({
      where: { email: 'alice@example.com' },
    });
    expect(database.user.create).toHaveBeenCalledWith({
      data: {
        email: 'alice@example.com',
        name: 'Alice',
        password: 'hashed-password',
      },
      select: {
        id: true,
        email: true,
        name: true,
        tasks: true,
      },
    });
  });

  it('rejects duplicate emails on create', async () => {
    database.user.findUnique.mockResolvedValue({ id: 1 });

    await expect(
      service.create({
        email: 'alice@example.com',
        password: 'StrongPassword123',
        name: 'Alice',
      }),
    ).rejects.toThrow(ConflictException);

    expect(database.user.create).not.toHaveBeenCalled();
  });

  it('finds users with search and pagination metadata', async () => {
    const users = [{ id: 1, email: 'alice@example.com', name: 'Alice' }];

    database.user.findMany.mockResolvedValue(users);
    database.user.count.mockResolvedValue(12);

    await expect(
      service.findAll({
        search: ' alice ',
        page: '2',
        limit: '5',
      }),
    ).resolves.toEqual({
      data: users,
      meta: {
        total: 12,
        page: 2,
        limit: 5,
        totalPages: 3,
      },
    });

    expect(database.user.findMany).toHaveBeenCalledWith({
      where: {
        OR: [
          { name: { contains: 'alice', mode: 'insensitive' } },
          { email: { contains: 'alice', mode: 'insensitive' } },
        ],
      },
      skip: 5,
      take: 5,
      select: {
        id: true,
        email: true,
        name: true,
        tasks: true,
      },
      orderBy: { id: 'asc' },
    });
  });

  it('rejects invalid pagination values', async () => {
    await expect(service.findAll({ page: '0' })).rejects.toThrow(
      BadRequestException,
    );

    await expect(service.findAll({ limit: '101' })).rejects.toThrow(
      BadRequestException,
    );

    expect(database.user.findMany).not.toHaveBeenCalled();
  });

  it('throws when a user cannot be found', async () => {
    database.user.findUnique.mockResolvedValue(null);

    await expect(service.findOne(123)).rejects.toThrow(NotFoundException);
  });

  it('updates a user and rejects another user email collision', async () => {
    database.user.findUnique
      .mockResolvedValueOnce({ id: 1, email: 'alice@example.com' })
      .mockResolvedValueOnce({ id: 2, email: 'bob@example.com' });

    await expect(
      service.update(1, { email: ' Bob@Example.com ' }),
    ).rejects.toThrow(ConflictException);

    expect(database.user.update).not.toHaveBeenCalled();
  });

  it('removes a user and converts delete failures to conflicts', async () => {
    database.user.findUnique.mockResolvedValue({
      id: 1,
      email: 'alice@example.com',
      name: 'Alice',
    });
    database.user.delete.mockRejectedValue(new Error('foreign key violation'));

    await expect(service.remove(1)).rejects.toThrow(ConflictException);
  });
});
