import {
  Controller,
  Get,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import { ApiOperation, ApiParam } from '@nestjs/swagger';

import { UsersService } from './users.service';
import { GetUsersByClientDto } from './dto/get-user-by-client.dto';
import { SanctumGuard } from 'src/auth/guards/sanctum.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { Users } from 'src/entities/users.entity';

@Controller('users')
@UseGuards(SanctumGuard)
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Get all users for the authenticated client',
  })
  async findByClient(
    @CurrentUser() user: Users,
    @Query() query: Omit<GetUsersByClientDto, 'clientId'>,
  ) {
    return this.usersService.findByClient(user, query);
  }

@Get(':userId')
async findOneByClient(
  @CurrentUser() user: Users,
  @Param('userId', ParseIntPipe) userId: number,
) {
  if (!user.client_id) {
    throw new NotFoundException('Client not found');
  }

  return this.usersService.findOneByClient(
    userId,
    user.client_id,
  );
}
}