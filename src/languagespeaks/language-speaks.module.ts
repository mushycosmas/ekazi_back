import { Module } from '@nestjs/common';
import { LanguageSpeaksService } from './language-speaks.service';
import { LanguageSpeaksController } from './language-speaks.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LanguageSpeaks } from 'src/entities/language-speaks.entity';

@Module({
      imports: [TypeOrmModule.forFeature([LanguageSpeaks])],
  controllers: [LanguageSpeaksController],
  providers: [LanguageSpeaksService],
})
export class LanguageSpeaksModule {}
