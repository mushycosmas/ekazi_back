import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Permission } from 'src/entities/permission.entity';
import { Users } from 'src/entities/users.entity';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { PersonalAccessToken } from 'src/entities/personal-access-token.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Users, Roles, Permission , PersonalAccessToken,])],
    controllers: [UsersController],
    providers: [UsersService],
    exports: [UsersService],
})
export class UsersModule { }
