import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JobRequirements } from '../entities/job-requirements.entity';
import { JobRequirementsService } from '../services/job-requirements.service';
import { JobRequirementsController } from '../controllers/job-requirements.controller';

@Module({
      imports: [
    TypeOrmModule.forFeature([
      JobRequirements,
    ]),
  ],
  controllers: [
    JobRequirementsController,
  ],
  providers: [JobRequirementsService],
  exports: [JobRequirementsService],
})
export class JobRequirementsModule {}
