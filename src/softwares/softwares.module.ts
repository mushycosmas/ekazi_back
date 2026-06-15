import { Module } from '@nestjs/common';
import { SoftwaresService } from './softwares.service';
import { SoftwaresController } from './softwares.controller';
import { Softwares } from 'src/entities/softwares.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
      imports: [TypeOrmModule.forFeature([Softwares])],
  controllers: [SoftwaresController],
  providers: [SoftwaresService],
})
export class SoftwaresModule {}
