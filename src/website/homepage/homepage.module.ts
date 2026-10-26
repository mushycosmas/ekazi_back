 
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { HomepageController } from './homepage.controller';
import { HomepageService } from './homepage.service';

import { Jobs } from 'src/jobs/entities/job.entity';
import { Clients } from 'src/client/clients.entity';
import { Users } from 'src/entities/users.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Clients,
      Users,
      Jobs,
    ]),
  ],
  controllers: [HomepageController],
  providers: [HomepageService],
  exports: [HomepageService],
})
export class HomepageModule {}
