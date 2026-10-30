import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Clients } from 'src/client/clients.entity';
import { ApplicantApplication } from 'src/entities/applicants/applicant-applicantions.entity';
import { ApplicantListing } from 'src/entities/applicants/applicant-listings.entity';
import { Applicants } from 'src/entities/applicants/applicants.entity';
import { Users } from 'src/entities/users.entity';
import { ApplicantController } from './applicant.controller';
import { ApplicantService } from './applicant.service';
import { PersonalAccessToken } from 'src/entities/personal-access-token.entity';
import { ApplicantPositions } from 'src/entities/applicants/applicant-positions.entity';
import { ApplicantViews } from 'src/entities/applicants/applicant-views.entity';
import { ApplicantRate } from 'src/entities/applicants/applicant-rate.entity';
import { ApplicantProfilePrivacy } from 'src/entities/applicants/applicant-profile-privacy.entity';
import { ApplicantFeaturedView } from 'src/entities/applicants/applicant-featured-view.entity';

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
            ApplicantViews,
            ApplicantRate,
            ApplicantProfilePrivacy,
            ApplicantFeaturedView,
        ]),
    ],

    controllers: [
        ApplicantController,
    ],

    providers: [
        ApplicantService,
    ],

    exports: [
        ApplicantService,
    ],
})
export class ApplicantModule { }
