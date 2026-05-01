import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { DatabaseService } from '../database/database.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

type FindAllUsersQuery = {
  search?: string;
  page?: string;
  limit?: string;
};

@Injectable()
export class UsersService {
  constructor(private readonly database: DatabaseService) {}

  async create(createUserDto: CreateUserDto) {
    const email = createUserDto.email.toLowerCase().trim();
    const existingUser = await this.database.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('Email already used');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    return this.database.user.create({
      data: {
        email,
        name: createUserDto.name,
        password: hashedPassword,
      },
      select: this.publicUserSelect(),
    });
  }

  async findAll(query: FindAllUsersQuery = {}) {
    const { page, limit, skip } = this.getPagination(query.page, query.limit);
    const normalizedSearch = query.search?.trim();
    const where: Prisma.UserWhereInput = {};

    if (normalizedSearch) {
      where.OR = [
        { name: { contains: normalizedSearch, mode: 'insensitive' } },
        { email: { contains: normalizedSearch, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.database.user.findMany({
        where,
        skip,
        take: limit,
        select: this.publicUserSelect(),
        orderBy: { id: 'asc' },
      }),
      this.database.user.count({ where }),
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
    const user = await this.database.user.findUnique({
      where: { id },
      select: this.publicUserSelect(),
    });

    if (!user) {
      throw new NotFoundException(`User #${id} not found`);
    }

    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    await this.findOne(id);

    const data: {
      email?: string;
      name?: string;
      password?: string;
    } = {};

    if (updateUserDto.email) {
      const email = updateUserDto.email.toLowerCase().trim();
      const existingUser = await this.database.user.findUnique({
        where: { email },
      });

      if (existingUser && existingUser.id !== id) {
        throw new ConflictException('Email already used');
      }

      data.email = email;
    }

    if (updateUserDto.name) {
      data.name = updateUserDto.name;
    }

    if (updateUserDto.password) {
      data.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    return this.database.user.update({
      where: { id },
      data,
      select: this.publicUserSelect(),
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    try {
      return await this.database.user.delete({
        where: { id },
        select: this.publicUserSelect(),
      });
    } catch {
      throw new ConflictException(
        `User #${id} cannot be deleted while tasks are attached`,
      );
    }
  }

  private publicUserSelect() {
    return {
      id: true,
      email: true,
      name: true,
      tasks: true,
    };
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
}
