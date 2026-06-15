import { Module } from '@nestjs/common';
import { Majors } from 'src/entities/majors.entity';
import { MajorsController } from './majors.controller';
import { MajorsService } from './majors.service';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
    imports: [TypeOrmModule.forFeature([Majors])],
    controllers: [MajorsController],
    providers: [MajorsService],
})
export class MajorsModule { }
