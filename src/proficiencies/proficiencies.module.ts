import { Module } from '@nestjs/common';
import { Proficiencies } from 'src/entities/proficiencies.entity';
import { ProficienciesController } from './proficiencies.controller';
import { ProficienciesService } from './proficiencies.service';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
    imports: [
        TypeOrmModule.forFeature([Proficiencies]),
    ],
    controllers: [ProficienciesController],
    providers: [ProficienciesService],
})
export class ProficienciesModule { }
