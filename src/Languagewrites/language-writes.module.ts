import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LanguageWrites } from 'src/entities/language-writes.entity';
import { LanguageWritesController } from './language-writes.controller';
import { LanguageWritesService } from './language-writes.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            LanguageWrites,
        ]),
    ],

    controllers: [LanguageWritesController,],
    providers: [
        LanguageWritesService,
    ],

    exports: [
        LanguageWritesService,],
})
export class LanguageWritesModule { }
