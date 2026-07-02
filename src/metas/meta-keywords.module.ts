import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MetaKeywords } from 'src/entities/meta-keywords.entity';
import { MetaKeywordsController } from './meta-keywords.controller';
import { MetaKeywordsService } from './meta-keywords.service';

@Module({
        imports: [
        TypeOrmModule.forFeature([
            MetaKeywords,
        ]),
    ],
    controllers: [MetaKeywordsController],
    providers: [MetaKeywordsService],
})
export class MetaKeywordsModule {}
