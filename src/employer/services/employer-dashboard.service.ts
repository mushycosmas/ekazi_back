import { Injectable } from '@nestjs/common';
import { Users } from 'src/entities/users.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Jobs } from 'src/jobs/entities/job.entity';
import { Repository } from 'typeorm';
import { ApplicantApplication } from 'src/entities/applicants/applicant-applicantions.entity';

@Injectable()
export class EmployerDashboardService {
    constructor(
        @InjectRepository(Jobs)
        private readonly jobsRepository: Repository<Jobs>,

        @InjectRepository(ApplicantApplication)
        private readonly applicantApplicationRepository: Repository<ApplicantApplication>,
    ) { }
    async dashboardStats(user: Users) {
        const clientId = user?.client_id;

        if (!clientId) {
            return {
                success: false,
                message: 'No client assigned',
            };
        }

        // 1. TOTAL JOBS
        const totalJobs = await this.jobsRepository
            .createQueryBuilder('job')
            .leftJoin('job.client', 'client')
            .where('client.id = :clientId', { clientId })
            .getCount();

        // ACTIVE JOBS
        // =========================
        const activeJobs = await this.jobsRepository
            .createQueryBuilder('job')
            .leftJoin('job.client', 'client')
            .where('client.id = :clientId', { clientId })
            .andWhere('job.dead_line >= CURDATE()')
            .getCount();

        // EXPIRED JOBS
        // =========================
        const expiredJobs = await this.jobsRepository
            .createQueryBuilder('job')
            .leftJoin('job.client', 'client')
            .where('client.id = :clientId', { clientId })
            .andWhere('job.dead_line < CURDATE()')
            .getCount();

        // 2. TOTAL APPLICATIONS
        const totalApplicationsResult = await this.jobsRepository
            .createQueryBuilder('job')
            .leftJoin('job.client', 'client')
            .leftJoin('job.applications', 'applications')
            .where('client.id = :clientId', { clientId })
            .select('COUNT(applications.id)', 'count')
            .getRawOne();

        const totalApplications = Number(totalApplicationsResult.count || 0);

        // 3. TOTAL JOB VIEWS
        const totalViewsResult = await this.jobsRepository
            .createQueryBuilder('job')
            .leftJoin('job.client', 'client')
            .leftJoin('job.jobStatistics', 'stats')
            .where('client.id = :clientId', { clientId })
            .select('SUM(stats.job_views)', 'views')
            .getRawOne();

        const totalJobViews = Number(totalViewsResult.views || 0);

        const pipeline = await this.applicantApplicationRepository
            .createQueryBuilder('app')
            .leftJoin('app.stage', 'stage')
            .leftJoin('app.job', 'job')
            .select('app.stage_id', 'stage_id')
            .addSelect('stage.stage_name', 'stage_name')
            .addSelect('COUNT(app.id)', 'total')
            .where('job.client_id = :clientId', { clientId })
            .andWhere('app.hide != 1')
            .groupBy('app.stage_id')
            .addGroupBy('stage.stage_name')
            .getRawMany();

        return {
            success: true,
            message: "successfull retrive job statics",
            data: {
                totalJobs,
                activeJobs,
                expiredJobs,
                totalApplications,
                totalJobViews,
                pipeline ,
            },
        };
    }
}
