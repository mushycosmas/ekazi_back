import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PositionLevelsController } from './position-levels.controller';
import { PositionLevelsService } from './position-levels.service';
import { PositionLevels } from 'src/entities/position-levels.entity';

@Module({
      imports: [TypeOrmModule.forFeature([PositionLevels])],
  controllers: [PositionLevelsController],
  providers: [PositionLevelsService],
})
export class PositionLevelsModule {}
