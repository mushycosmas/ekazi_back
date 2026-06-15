import { Module } from '@nestjs/common';
import { MaritalStatuses } from 'src/entities/marital-statuses.entity';
import { MalitalStatusesService } from './malital-statuses.service';
import { MalitalStatusesController } from './malital-statuses.controller';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
    imports: [
        TypeOrmModule.forFeature([MaritalStatuses]),
    ],
    controllers: [MalitalStatusesController],
    providers: [MalitalStatusesService],
})
export class MalitalStatusesModule { }
