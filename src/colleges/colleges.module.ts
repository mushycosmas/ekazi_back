import { Module } from '@nestjs/common';
import { Colleges } from 'src/entities/colleges.entity';
import { CollegesController } from './colleges.controller';
import { CollegesService } from './colleges.service';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
    imports: [TypeOrmModule.forFeature([Colleges])],
    controllers: [CollegesController],
    providers: [CollegesService],
})
export class CollegesModule { }
