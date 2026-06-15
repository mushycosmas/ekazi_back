import { Module } from '@nestjs/common';
import { IndustriesController } from './industries.controller';
import { Industries } from 'src/entities/industries.entity';
import { IndustriesService } from './industries.service';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
    imports: [TypeOrmModule.forFeature([Industries])],
    controllers: [IndustriesController],
    providers: [IndustriesService],
})
export class IndustriesModule { }
