import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JobLanguagesService } from '../services/job-languages.service';
import { JobLanguagesController } from '../controllers/job-languages.controller';
import { JobLanguages } from '../entities/job-languages.entity';

@Module({
    imports: [TypeOrmModule.forFeature([JobLanguages])],
    controllers: [JobLanguagesController],
    providers: [JobLanguagesService],
    exports: [JobLanguagesService], // optional (use if needed in other modules)
})
export class JobLanguagesModule { }
