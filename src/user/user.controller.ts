import { Body, Controller, Get, Post, Param, Delete, Put } from '@nestjs/common';
import { UserService } from './user.service';
import { users } from '@prisma/client';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async createUser(@Body() body: any): Promise<users> {
    // pass as a single object
    return this.userService.createUser({
      username: body.username,
      email: body.email,
      password: body.password,
      role_id: body.role_id,      // required field
      hide: body.hide,            // optional
      provider: body.provider,
      provider_id: body.provider_id,
      terms: body.terms,
    });
  }

  @Get()
  async getUsers(): Promise<users[]> {
    return this.userService.getUsers();
  }

  @Get(':id')
  async getUser(@Param('id') id: number): Promise<users | null> {
    return this.userService.getUserById(Number(id));
  }

  @Put(':id')
  async updateUser(@Param('id') id: number, @Body() body: any): Promise<users> {
    return this.userService.updateUser(Number(id), body);
  }

  @Delete(':id')
  async deleteUser(@Param('id') id: number): Promise<users> {
    return this.userService.deleteUser(Number(id));
  }
}