import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Regions } from 'src/entities/regions.entity';
import { RegionsController } from './regions.controller';
import { RegionsService } from './regions.service';

@Module({
    imports: [TypeOrmModule.forFeature([Regions])],
    controllers: [RegionsController],
    providers: [RegionsService],
})
export class RegionsModule { }
