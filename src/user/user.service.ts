import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  createUser(name: string, email: string) {
    return this.prisma.user.create({
      data: { name, email },
    });
  }

  getUsers() {
    return this.prisma.user.findMany();
  }

  getUserById(id: number) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  deleteUser(id: number) {
    return this.prisma.user.delete({ where: { id } });
  }
}