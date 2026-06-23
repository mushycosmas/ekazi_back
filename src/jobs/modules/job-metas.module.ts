import { Module } from '@nestjs/common';
import { JobMetaService } from '../services/job-meta.service';
import { JobMetas } from '../entities/job-metas.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JobMetasController } from '../controllers/job-metas.controller';
import { JobEducationModule } from './job-education.module';

@Module({
      imports: [
        TypeOrmModule.forFeature([JobMetas]),
        JobEducationModule,
    ],
    controllers: [JobMetasController],
    providers: [JobMetaService],
})
export class JobMetasModule {}
