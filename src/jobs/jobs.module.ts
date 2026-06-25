import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Jobs } from './entities/job.entity';
import { JobsController } from './jobs.controller';
import { JobsService } from './jobs.service';
import { Clients } from 'src/client/clients.entity';
import { JobCultures } from './entities/job-cultures.entity';
import { JobProficiencies } from './entities/job-proficiencies.entity';
import { JobPersonalities } from './entities/job-personalities.entity';
import { JobTool } from './entities/job-tool.entity';
import { JobSoftware } from './entities/job-software.entity';
import { JobKnowledge } from './entities/job-knowledge.entity';
import { JobAddresses } from './entities/job-addresses.entity';

@Module({
    imports: [TypeOrmModule.forFeature([
        Jobs, Clients, JobCultures,
        JobPersonalities,
        JobSoftware,
        JobTool,
        JobKnowledge,
        JobProficiencies,
        JobAddresses,
    ])],
    controllers: [JobsController],
    providers: [JobsService],
    exports: [JobsService],
})
export class JobsModule { }
