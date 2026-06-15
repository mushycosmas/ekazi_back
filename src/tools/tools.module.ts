import { Module } from '@nestjs/common';
import { ToolsController } from './tools.controller';
import { ToolsService } from './tools.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tools } from 'src/entities/tools.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Tools])],
    controllers: [ToolsController],
    providers: [ToolsService],
})
export class ToolsModule { }
