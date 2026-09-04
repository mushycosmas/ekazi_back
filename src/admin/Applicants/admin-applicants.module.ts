import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Clients } from 'src/client/clients.entity';
import { ApplicantApplication } from 'src/entities/applicants/applicant-applicantions.entity';
import { ApplicantListing } from 'src/entities/applicants/applicant-listings.entity';
import { ApplicantPositions } from 'src/entities/applicants/applicant-positions.entity';
import { Applicants } from 'src/entities/applicants/applicants.entity';
import { PersonalAccessToken } from 'src/entities/personal-access-token.entity';
import { Users } from 'src/entities/users.entity';
import { AdminApplicantsController } from './admin-applicants.controller';
import { AdminApplicantsService } from './admin-applicants.service';

@Module({
        imports: [
            TypeOrmModule.forFeature([
                Applicants,
                Users,
                PersonalAccessToken,
                Clients,
                ApplicantApplication,
                ApplicantListing,
                ApplicantPositions,
            ]),
        ],
    
        controllers: [
        
            AdminApplicantsController,
        ],
    
        providers: [
           
            AdminApplicantsService,
        ],
    
        exports: [
             AdminApplicantsService,
        ],
})
export class AdminApplicantsModule {}
