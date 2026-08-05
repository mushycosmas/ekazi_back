import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Jobs } from '../entities/job.entity';
import { Applicants } from 'src/entities/applicants/applicants.entity';
import { JobMatchController } from '../controllers/job-match.controller';
import { JobMatchService } from '../services/job-match.service';
import { Users } from 'src/entities/users.entity';
import { PersonalAccessToken } from 'src/entities/personal-access-token.entity';

@Module({
      imports: [
    TypeOrmModule.forFeature([
      Jobs,
      Applicants,
      Users,
      PersonalAccessToken,
    ]),
  ],
  controllers: [JobMatchController],
  providers: [JobMatchService],
  exports: [JobMatchService],
})
export class JobMatchModule {}
