import { Module } from '@nestjs/common';
import { Positions } from 'src/entities/positions.entity';
import { PositionsController } from './positions.controller';
import { PositionsService } from './positions.service';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
    imports: [
        TypeOrmModule.forFeature([Positions]),
    ],
    controllers: [PositionsController],
    providers: [PositionsService],
})
export class PositionsModule { }
