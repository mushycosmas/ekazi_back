import { Module } from '@nestjs/common';
import { CoursesController } from './courses.controller';
import { CoursesService } from './courses.service';
import { Courses } from 'src/entities/courses.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
    imports: [TypeOrmModule.forFeature([Courses])],
    controllers: [CoursesController],
    providers: [CoursesService],
})
export class CoursesModule { }
