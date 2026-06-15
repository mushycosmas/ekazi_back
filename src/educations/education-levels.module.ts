import { Module } from '@nestjs/common';
import { EducationLevels } from 'src/entities/education-levels.entity';
import { EducationLevelsController } from './education-levels.controller';
import { EducationLevelsService } from './education-levels.service';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
    imports: [TypeOrmModule.forFeature([EducationLevels])],
    controllers: [EducationLevelsController],
    providers: [EducationLevelsService],
})
export class EducationLevelsModule { }
