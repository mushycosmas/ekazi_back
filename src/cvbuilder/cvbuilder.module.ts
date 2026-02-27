import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CvbuilderService } from './cvbuilder.service';
import { CvbuilderController } from './cvbuilder.controller';
import { Applicants } from 'src/entities/applicants/applicants.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Applicants])],
  controllers: [CvbuilderController],
  providers: [CvbuilderService],
})
export class CvbuilderModule {}