 import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

 import { InterviewAction } from 'src/jobs/entities/interview/interview-action.entity';

import { InterviewActionController } from './interview-action.controller';
import { InterviewActionService } from './interview-action.service';
import { Users } from 'src/entities/users.entity';
import { PersonalAccessToken } from 'src/entities/personal-access-token.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            InterviewAction,
            Users,
            PersonalAccessToken,
        ]),
    ],

    controllers: [
        InterviewActionController,
    ],

    providers: [
        InterviewActionService,
    ],

    exports: [
        InterviewActionService,
    ],
})
export class InterviewActionModule {}