import { Module } from '@nestjs/common';
import { Personalities } from 'src/entities/personalities.entity';
import { PersonalitiesController } from './personalities.controller';
import { PersonalitiesService } from './personalities.service';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
    imports: [
        TypeOrmModule.forFeature([Personalities]),
    ],
    controllers: [PersonalitiesController],
    providers: [PersonalitiesService],
})
export class PersonalitiesModule { }
