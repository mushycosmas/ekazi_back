import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientStaffPosition } from 'src/client/entities/client-staff-position.entity';
import { ClientStaffPositionsController } from './client-staff-positions.controller';
import { ClientStaffPositionsService } from './client-staff-positions.service';
import { Users } from 'src/entities/users.entity';
import { PersonalAccessToken } from 'src/entities/personal-access-token.entity';

@Module({
      imports: [
    TypeOrmModule.forFeature([
      ClientStaffPosition,
      Users,
      PersonalAccessToken,
    ]),
  ],

  controllers: [
    ClientStaffPositionsController,
  ],

  providers: [
    ClientStaffPositionsService,
  ],

  exports: [
    ClientStaffPositionsService,
  ],
})
export class ClientStaffPositionsModule {}
