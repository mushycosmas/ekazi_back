import { Module } from '@nestjs/common';
import { CvBuilderService } from './cv-builder.service';
import { CvBuilderController } from './cv-builder.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  providers: [CvBuilderService, PrismaService],
  controllers: [CvBuilderController],
})
export class CvBuilderModule {}