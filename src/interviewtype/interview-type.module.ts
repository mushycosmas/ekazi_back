import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InterviewType } from 'src/jobs/entities/interview/interview-type.entity';
import { InterviewTypeController } from './interview-type.controller';
import { InterviewTypeService } from './interview-type.service';
import { PersonalAccessToken } from 'src/entities/personal-access-token.entity';
import { Users } from 'src/entities/users.entity';

@Module({
        imports: [
        TypeOrmModule.forFeature([
            InterviewType,
            Users,
            PersonalAccessToken,
            
        ]),
    ],
    controllers: [
        InterviewTypeController,
    ],
    providers: [
        InterviewTypeService,
    ],
    exports: [
        InterviewTypeService,
    ],
})
export class InterviewTypeModule {}
