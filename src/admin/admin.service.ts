import {
    Injectable,
    NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';

import {
    Repository,
    DataSource,
} from 'typeorm';


import { Users } from 'src/entities/users.entity';
import { Applicants } from 'src/entities/applicants/applicants.entity';
import { Jobs } from 'src/jobs/entities/job.entity';
import { Notification } from 'src/client/entities/notifications.entity';
import { Clients } from 'src/client/clients.entity';
import { JobStage } from 'src/jobs/entities/job-stage.entity';

@Injectable()
export class AdminService {

    constructor(
        @InjectRepository(JobStage)
        private readonly jobStageRepository:
            Repository<JobStage>,
        @InjectRepository(Users)
        private readonly userRepository:
            Repository<Users>,

        @InjectRepository(Applicants)
        private readonly applicantRepository:
            Repository<Applicants>,

        @InjectRepository(Jobs)
        private readonly jobRepository:
            Repository<Jobs>,

     

        private readonly dataSource:
            DataSource,

    ) { }


    // ============================================================
    // DASHBOARD
    // ============================================================

    async dashboard() {

        const currentYear =
            new Date().getFullYear();




        // ========================================================
        // JOBS CREATED BY MONTH
        // ========================================================

        const jobsByMonth =
            await this.jobRepository
                .createQueryBuilder('job')
                .select(
                    "DATE_FORMAT(job.created_at, '%b-%Y')",
                    'period',
                )
                .addSelect(
                    'COUNT(job.id)',
                    'count',
                )
                .where('job.hide = :hide', {
                    hide: 0,
                })
                .andWhere(
                    'YEAR(job.created_at) = :year',
                    {
                        year: currentYear,
                    },
                )
                .groupBy(
                    "DATE_FORMAT(job.created_at, '%b-%Y')",
                )
                .orderBy(
                    'MIN(job.created_at)',
                    'ASC',
                )
                .getRawMany();



        // ========================================================
        // JOBS BY STAGE
        // ========================================================



        const jobsByStage =
            await this.jobStageRepository
                .createQueryBuilder('jobStage')

                .leftJoin(
                    'jobStage.stage',
                    'stage',
                )

                .leftJoin(
                    'jobStage.job',
                    'job',
                )

                .select(
                    'stage.id',
                    'stage_id',
                )

                .addSelect(
                    'stage.stage_name',
                    'stage_name',
                )

                .addSelect(
                    'COUNT(DISTINCT job.id)',
                    'count',
                )

                .where(
                    'job.hide = :hide',
                    {
                        hide: false,
                    },
                )

                .andWhere(
                    'YEAR(job.created_at) = :year',
                    {
                        year: currentYear,
                    },
                )

                .groupBy(
                    'stage.id',
                )

                .addGroupBy(
                    'stage.stage_name',
                )

                .orderBy(
                    'stage.id',
                    'ASC',
                )

                .getRawMany();



        // ========================================================
        // APPLICANT PROFILE COMPLETION
        // ========================================================

        const applicantProfile =
            await this.applicantRepository
                .createQueryBuilder('applicant')
                .select(
                    "DATE_FORMAT(applicant.created_at, '%b-%Y')",
                    'period',
                )
                .addSelect(
                    'MONTH(applicant.created_at)',
                    'month_number',
                )
                .addSelect(
                    'COUNT(applicant.id)',
                    'count',
                )
                .addSelect(
                    `SUM(
                CASE
                    WHEN applicant.status_profile = 1
                    THEN 1
                    ELSE 0
                END
            )`,
                    'complete',
                )
                .addSelect(
                    `SUM(
                CASE
                    WHEN applicant.status_profile = 0
                    THEN 1
                    ELSE 0
                END
            )`,
                    'uncomplete',
                )
                .where(
                    'YEAR(applicant.created_at) = :year',
                    {
                        year: currentYear,
                    },
                )
                .groupBy(
                    "DATE_FORMAT(applicant.created_at, '%b-%Y')",
                )
                .addGroupBy(
                    'MONTH(applicant.created_at)',
                )
                .orderBy(
                    'MONTH(applicant.created_at)',
                    'ASC',
                )
                .getRawMany();





        // ========================================================
        // EMPLOYERS
        // ========================================================

        const employerCount =
            await this.userRepository
                .createQueryBuilder('user')
                .where(
                    'user.role_id = :role',
                    {
                        role: 9,
                    },
                )
                .andWhere(
                    'user.last_activity_at IS NOT NULL',
                )
                .getCount();


        // ========================================================
        // CANDIDATES
        // ========================================================

        const candidateCount =
            await this.userRepository
                .createQueryBuilder('user')
                .where(
                    'user.role_id = :role',
                    {
                        role: 12,
                    },
                )
                .andWhere(
                    'user.last_activity_at IS NOT NULL',
                )
                .getCount();


        // ========================================================
        // FREELANCERS
        // ========================================================

        const freelancerCount =
            await this.userRepository
                .createQueryBuilder('user')
                .where(
                    'user.role_id = :role',
                    {
                        role: 0,
                    },
                )
                .andWhere(
                    'user.last_activity_at IS NOT NULL',
                )
                .getCount();


        // ========================================================
        // VERIFIED EMPLOYERS
        // ========================================================

        const verifiedEmployerCount =
            await this.userRepository.count({
                where: {
                    role_id: 9,
                    verified: true,
                },
            });


        // ========================================================
        // NON VERIFIED EMPLOYERS
        // ========================================================

        const nonVerifiedEmployerCount =
            await this.userRepository.count({
                where: {
                    role_id: 9,
                    verified: false,
                },
            });


        // ========================================================
        // VERIFIED JOB SEEKERS
        // ========================================================

        const verifiedJobSeekerCount =
            await this.userRepository.count({
                where: {
                    role_id: 12,
                    verified: true,
                },
            });


        // ========================================================
        // NON VERIFIED JOB SEEKERS
        // ========================================================

        const nonVerifiedJobSeekerCount =
            await this.userRepository.count({
                where: {
                    role_id: 12,
                    verified: false,
                },
            });


        // ========================================================
        // ADMINS
        // ========================================================

        const adminCount =
            await this.userRepository.count({
                where: {
                    role_id: 2,
                },
            });


        // ========================================================
        // RESPONSE
        // ========================================================

        return {

            success: true,

            message:
                'Admin dashboard retrieved successfully',

            data: {

                jobsByMonth,
                jobsByStage,
                applicantProfile,
                statistics: {

                    employerCount,

                    candidateCount,

                    freelancerCount,

                    verifiedEmployerCount,

                    nonVerifiedEmployerCount,

                    verifiedJobSeekerCount,

                    nonVerifiedJobSeekerCount,

                    adminCount,

                },

            },

        };
    }
}