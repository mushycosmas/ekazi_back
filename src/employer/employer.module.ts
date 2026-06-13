import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Users } from 'src/entities/users.entity';
import { EmployerController } from './controllers/employer.controller';
import { EmployerUserController } from './controllers/employer-user.controller';
import { EmployerUserService } from './services/employer-user.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Users]),
  ],
  controllers: [
    EmployerController,
    EmployerUserController,
  ],
  providers: [EmployerUserService],
})
export class EmployerModule {}