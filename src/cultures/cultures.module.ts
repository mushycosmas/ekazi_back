import { Module } from '@nestjs/common';
import { Cultures } from 'src/entities/cultures.entity';
import { CulturesController } from './cultures.controller';
import { CulturesService } from './cultures.service';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
      imports: [TypeOrmModule.forFeature([Cultures])],
  controllers: [CulturesController],
  providers: [CulturesService],
})
export class CulturesModule {}
