
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Applicants } from 'src/entities/applicants/applicants.entity';
import { ApplicantApplication } from
    'src/entities/applicants/applicant-applicantions.entity';
import { JobCarts } from 'src/jobs/entities/job-carts.entity';
import { ApplicantSavedResumes } from 'src/entities/applicants/applicant-cv-template.entity';
import { JobStage } from 'src/jobs/entities/job-stage.entity';

@Injectable()
export class ApplicantDashboardService {
    constructor(
        @InjectRepository(Applicants)
        private readonly applicantsRepository: Repository<Applicants>,

        @InjectRepository(ApplicantApplication)
        private readonly applicationRepository: Repository<ApplicantApplication>,

        @InjectRepository(ApplicantSavedResumes)
        private readonly savedResumesRepository: Repository<ApplicantSavedResumes>,

        @InjectRepository(JobCarts)
        private readonly jobCartsRepository: Repository<JobCarts>,

        @InjectRepository(JobStage)
        private readonly jobStageRepository: Repository<JobStage>,
    ) { }

    async statisticsDashboard(userId: number) {
        // Resolve applicant profile using the authenticated user's ID.
        const applicant = await this.applicantsRepository.findOne({
            select: { id: true },
            where: { user_id: userId },
        });

        if (!applicant) {
            throw new NotFoundException('Applicant profile not found');
        }

        const applicantId = applicant.id;

        // Count all dashboard statistics in parallel.
        const [
            application,
            download_cv,
            savedjob,
        ] = await Promise.all([
            this.applicationRepository.count({
                where: { applicant_id: applicantId },
            }),

            this.savedResumesRepository.count({
                where: { applicant_id: applicantId },
            }),

            this.jobCartsRepository.count({
                where: { applicant_id: applicantId },
            }),
        ]);

        const statisticsdashboard = {
            application,
            download_cv,
            savedjob,
            searchjob: 0,
        };

        return {
            success: true,
            statisticsdashboard,
        };
    }
    async applicationPipeline(userId: number) {
        // Find the applicant profile for the logged-in user
        const applicant = await this.applicantsRepository.findOne({
            select: { id: true },
            where: { user_id: userId },
        });

        if (!applicant) {
            throw new NotFoundException('Applicant profile not found');
        }

        // Get pipeline stages belonging to this applicant
        const applicantPipeline = await this.jobStageRepository.find({
            where: {
                applicant_id: applicant.id,
            },
            relations: {
                stage: true,
            },
            order: {
                created_at: 'DESC',
            },
        });

        return {
            success: true,
            applicant_pipeline: applicantPipeline,
        };
    }
}
