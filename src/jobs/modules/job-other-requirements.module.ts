import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JobOtherRequirements } from '../entities/job-other-requirements.entity';
import { JobOtherRequirementsController } from '../controllers/job-other-requirements.controller';
import { JobOtherRequirementsService } from '../services/job-other-requirements.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            JobOtherRequirements,
        ]),
    ],
    controllers: [
        JobOtherRequirementsController,
    ],
    providers: [
        JobOtherRequirementsService,
    ],
})
export class JobOtherRequirementsModule { }
