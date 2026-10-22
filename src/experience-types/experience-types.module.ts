 import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ExperienceTypes } from
  'src/entities/experience-types.entity';

import { ExperienceTypesController } from
  './experience-types.controller';

import { ExperienceTypesService } from
  './experience-types.service';
import { Users } from 'src/entities/users.entity';
import { PersonalAccessToken } from 'src/entities/personal-access-token.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
        ExperienceTypes,
        Users,
        PersonalAccessToken,
    ]),
  ],
  controllers: [ExperienceTypesController],
  providers: [ExperienceTypesService],
  exports: [ExperienceTypesService],
})
export class ExperienceTypesModule {}