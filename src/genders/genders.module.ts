import { Module } from '@nestjs/common';
import { Genders } from 'src/entities/genders.entity';
import { GendersController } from './genders.controller';
import { GendersService } from './genders.service';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
    imports: [TypeOrmModule.forFeature([Genders])],
    controllers: [GendersController],
    providers: [GendersService],
})
export class GendersModule { }
