import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { users } from '@prisma/client';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  // Create a new user
  async createUser(data: {
    provider?: string;
    provider_id?: string;
    terms?: string;
    role_id: number;
    username?: string;
    email?: string;
    password?: string;
    hide?: boolean;
  }): Promise<users> {
    const createUserData = {
      ...data,
      hide: data.hide ?? false, // default hide to false
    };

    // ✅ Use prisma.users instead of prisma.user
    return await this.prisma.users.create({ data: createUserData });
  }

  // Get all users
  async getUsers(): Promise<users[]> {
    return await this.prisma.users.findMany(); // ✅ plural
  }

  // Get a user by ID
  async getUserById(id: number): Promise<users | null> {
    return await this.prisma.users.findUnique({ where: { id } }); // ✅ plural
  }

  // Update a user
  async updateUser(
    id: number,
    data: Partial<Omit<users, 'id' | 'created_at' | 'updated_at'>>,
  ): Promise<users> {
    const updateData = {
      ...data,
      hide: data.hide ?? false, // ensure hide is boolean
    };

    return await this.prisma.users.update({
      where: { id },
      data: updateData,
    });
  }

  // Delete a user
  async deleteUser(id: number): Promise<users> {
    return await this.prisma.users.delete({ where: { id } }); // ✅ plural
  }
}