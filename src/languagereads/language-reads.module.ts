import { Module } from '@nestjs/common';
import { LanguagesReadsService } from './languages-reads.service';
import { LanguageReadsController } from './language-reads.controller';
import { LanguageReads } from 'src/entities/language-reads.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
    imports: [TypeOrmModule.forFeature([LanguageReads])],
    controllers: [LanguageReadsController],
    providers: [LanguagesReadsService],
})
export class LanguageReadsModule { }
