import { Module } from '@nestjs/common';
import { Languages } from 'src/entities/languages.entity';
import { LanguagesService } from './languages.service';
import { LanguagesController } from './languages.controller';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
    imports: [TypeOrmModule.forFeature([Languages])],
    controllers: [LanguagesController],
    providers: [LanguagesService],
})
export class LanguagesModule { }
