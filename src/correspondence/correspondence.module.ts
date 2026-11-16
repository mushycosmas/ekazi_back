 import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CorrespondenceController } from './correspondence.controller';
import { CorrespondenceService } from './correspondence.service';
import { CorrespondenceThread } from 'src/entities/correspondence-thread.entity';
import { Correspondence } from 'src/entities/correspondence.entity';
import { CorrespondenceParticipant } from 'src/entities/correspondence-participant.entity';
import { CorrespondenceAttachment } from 'src/entities/correspondence-attachment.entity';
import { CorrespondenceGateway } from './correspondence.gateway';
import { Users } from 'src/entities/users.entity';
import { PersonalAccessToken } from 'src/entities/personal-access-token.entity';
 
 

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CorrespondenceThread,
      Correspondence,
      CorrespondenceParticipant,
      CorrespondenceAttachment,
      Users,
      PersonalAccessToken,
    ]),
  ],

  controllers: [
    CorrespondenceController,
  ],

  providers: [
    CorrespondenceService,
    CorrespondenceGateway,
  ],

  exports: [
    CorrespondenceService,
    CorrespondenceGateway,
  ],
})
export class CorrespondenceModule {}