import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { DatabaseService } from '../database/database.service';
import { AuthService } from './auth.service';
import * as bcrypt from 'bcryptjs';

jest.mock('bcryptjs', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;
  let database: {
    user: {
      findUnique: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
    };
  };
  let jwtService: {
    signAsync: jest.Mock;
  };

  const bcryptMock = bcrypt as jest.Mocked<typeof bcrypt>;

  beforeEach(async () => {
    database = {
      user: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
    };
    jwtService = {
      signAsync: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: DatabaseService,
          useValue: database,
        },
        {
          provide: JwtService,
          useValue: jwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('registers a user with normalized email and stores hashed refresh token', async () => {
    const user = {
      id: 1,
      email: 'alice@example.com',
      name: 'Alice',
    };

    database.user.findUnique.mockResolvedValue(null);
    database.user.create.mockResolvedValue(user);
    jwtService.signAsync
      .mockResolvedValueOnce('access-token')
      .mockResolvedValueOnce('refresh-token');
    bcryptMock.hash
      .mockResolvedValueOnce('hashed-password' as never)
      .mockResolvedValueOnce('hashed-refresh-token' as never);

    await expect(
      service.register({
        email: ' Alice@Example.com ',
        password: 'StrongPassword123',
        name: 'Alice',
      }),
    ).resolves.toEqual({
      user,
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    });

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
      },
    });
    expect(database.user.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { hashedRefreshToken: 'hashed-refresh-token' },
    });
  });

  it('rejects registration when the email is already used', async () => {
    database.user.findUnique.mockResolvedValue({ id: 1 });

    await expect(
      service.register({
        email: 'alice@example.com',
        password: 'StrongPassword123',
        name: 'Alice',
      }),
    ).rejects.toThrow(ConflictException);

    expect(database.user.create).not.toHaveBeenCalled();
  });

  it('logs in a user with valid credentials', async () => {
    database.user.findUnique.mockResolvedValue({
      id: 1,
      email: 'alice@example.com',
      name: 'Alice',
      password: 'hashed-password',
    });
    bcryptMock.compare.mockResolvedValue(true as never);
    bcryptMock.hash.mockResolvedValue('hashed-refresh-token' as never);
    jwtService.signAsync
      .mockResolvedValueOnce('access-token')
      .mockResolvedValueOnce('refresh-token');

    await expect(
      service.login({
        email: ' Alice@Example.com ',
        password: 'StrongPassword123',
      }),
    ).resolves.toEqual({
      user: {
        id: 1,
        email: 'alice@example.com',
        name: 'Alice',
      },
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    });

    expect(bcryptMock.compare).toHaveBeenCalledWith(
      'StrongPassword123',
      'hashed-password',
    );
  });

  it('rejects login when credentials are invalid', async () => {
    database.user.findUnique.mockResolvedValue({
      id: 1,
      email: 'alice@example.com',
      password: 'hashed-password',
    });
    bcryptMock.compare.mockResolvedValue(false as never);

    await expect(
      service.login({
        email: 'alice@example.com',
        password: 'wrong-password',
      }),
    ).rejects.toThrow(UnauthorizedException);

    expect(jwtService.signAsync).not.toHaveBeenCalled();
  });

  it('refreshes tokens when the refresh token matches', async () => {
    database.user.findUnique.mockResolvedValue({
      id: 1,
      email: 'alice@example.com',
      name: 'Alice',
      hashedRefreshToken: 'hashed-refresh-token',
    });
    bcryptMock.compare.mockResolvedValue(true as never);
    bcryptMock.hash.mockResolvedValue('new-hashed-refresh-token' as never);
    jwtService.signAsync
      .mockResolvedValueOnce('new-access-token')
      .mockResolvedValueOnce('new-refresh-token');

    await expect(
      service.refreshTokens(1, { refreshToken: 'refresh-token' }),
    ).resolves.toEqual({
      user: {
        id: 1,
        email: 'alice@example.com',
        name: 'Alice',
      },
      accessToken: 'new-access-token',
      refreshToken: 'new-refresh-token',
    });
  });

  it('logs out by clearing the refresh token hash', async () => {
    database.user.update.mockResolvedValue({});

    await expect(service.logout(1)).resolves.toEqual({
      message: 'Logged out successfully',
    });

    expect(database.user.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { hashedRefreshToken: null },
    });
  });
});
