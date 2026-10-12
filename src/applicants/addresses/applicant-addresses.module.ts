 
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ApplicantAddresses } from 'src/entities/applicants/applicant-addresses.entity';
import { Applicants } from 'src/entities/applicants/applicants.entity';
import { Regions } from 'src/entities/regions.entity';

import { ApplicantAddressesController } from './applicant-addresses.controller';
import { ApplicantAddressesService } from './applicant-addresses.service';
import { Users } from 'src/entities/users.entity';
import { PersonalAccessToken } from 'src/entities/personal-access-token.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ApplicantAddresses,
      Applicants,
      Regions,
      Users,
      PersonalAccessToken,
    ]),
  ],
  controllers: [ApplicantAddressesController],
  providers: [ApplicantAddressesService],
  exports: [ApplicantAddressesService],
})
export class ApplicantAddressesModule {}
