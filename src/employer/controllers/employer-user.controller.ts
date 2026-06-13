 import { Controller, Get, Param } from '@nestjs/common';
import { EmployerUserService } from '../services/employer-user.service';

@Controller('employer-user')
export class EmployerUserController {
constructor(private readonly employerUserService: EmployerUserService) {}

  @Get(':clientId')
  async getUsers(@Param('clientId') clientId: number) {
    return this.employerUserService.users(Number(clientId));
  }
}