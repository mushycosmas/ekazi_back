import { Module } from '@nestjs/common';
import { Knowledge } from 'src/entities/knowledge.entity';
import { KnowledgeService } from './knowledge.service';
import { KnowledgeController } from './knowledge.controller';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
    imports: [TypeOrmModule.forFeature([Knowledge])],
    controllers: [KnowledgeController],
    providers: [KnowledgeService],
})
export class KnowledgeModule { }
