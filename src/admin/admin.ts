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

        @InjectRepository(Notification)
        private readonly notificationRepository:
            Repository<Notification>,

        @InjectRepository(Clients)
        private readonly clientRepository:
            Repository<Clients>,

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
            await this.jobRepository
                .createQueryBuilder('job')
                .select(
                    'job.stage_id',
                    'stage_id',
                )
                .addSelect(
                    "DATE_FORMAT(job.created_at, '%b-%Y')",
                    'period',
                )
                .addSelect(
                    'COUNT(job.id)',
                    'count',
                )
                .where(
                    'job.hide = :hide',
                    {
                        hide: 0,
                    },
                )
                .andWhere(
                    'YEAR(job.created_at) = :year',
                    {
                        year: currentYear,
                    },
                )
                .groupBy('job.stage_id')
                .addGroupBy(
                    "DATE_FORMAT(job.created_at, '%b-%Y')",
                )
                .getRawMany();


        // ========================================================
        // APPLICANTS BY MONTH
        // ========================================================

        const applicantsByMonth =
            await this.applicantRepository
                .createQueryBuilder('applicant')
                .select(
                    "DATE_FORMAT(applicant.created_at, '%b-%Y')",
                    'period',
                )
                .addSelect(
                    'COUNT(applicant.id)',
                    'count',
                )
                .groupBy(
                    "DATE_FORMAT(applicant.created_at, '%b-%Y')",
                )
                .orderBy(
                    'MIN(applicant.created_at)',
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
        // INCOMPLETE APPLICANTS
        // ========================================================

        // const incompleteApplicants =
        //     await this.applicantRepository
        //         .createQueryBuilder('applicant')
        //         .select(
        //             "DATE_FORMAT(applicant.created_at, '%b-%Y')",
        //             'period',
        //         )
        //         .addSelect(
        //             'COUNT(applicant.id)',
        //             'count',
        //         )
        //         .where(
        //             'applicant.picture IS NULL',
        //         )
        //         .groupBy(
        //             "DATE_FORMAT(applicant.created_at, '%b-%Y')",
        //         )
        //         .getRawMany();


        // ========================================================
        // ONLINE USERS
        // ========================================================

        // const onlineUsers =
        //     await this.userRepository.find({

        //         where: {
        //             // handled below because TypeORM
        //             // date condition is easier with query builder
        //         },

        //         order: {
        //             last_activity_at: 'DESC',
        //         },

        //         take: 10,

        //     });


        // const fiveMinutesAgo =
        //     new Date(
        //         Date.now() -
        //         5 * 60 * 1000,
        //     );


        // const currentlyOnline =
        //     await this.userRepository
        //         .createQueryBuilder('user')
        //         .where(
        //             'user.last_activity_at IS NOT NULL',
        //         )
        //         .andWhere(
        //             'user.last_activity_at >= :date',
        //             {
        //                 date: fiveMinutesAgo,
        //             },
        //         )
        //         .orderBy(
        //             'user.last_activity_at',
        //             'DESC',
        //         )
        //         .take(10)
        //         .getMany();


        // ========================================================
        // LAST ACTIVE USERS
        // ========================================================

        // const lastActiveUsers =
        //     await this.userRepository
        //         .createQueryBuilder('user')
        //         .select([
        //             'user.id',
        //             'user.username',
        //             'user.email',
        //             'user.last_activity_at',
        //         ])
        //         .where(
        //             'user.last_activity_at IS NOT NULL',
        //         )
        //         .orderBy(
        //             'user.last_activity_at',
        //             'DESC',
        //         )
        //         .take(10)
        //         .getMany();


        // ========================================================
        // USERS CREATED IN LAST 30 DAYS
        // ========================================================

        // const thirtyDaysAgo =
        //     new Date(
        //         Date.now() -
        //         30 * 24 * 60 * 60 * 1000,
        //     );


        // const userRegistrations =
        //     await this.userRepository
        //         .createQueryBuilder('user')
        //         .select(
        //             'DATE(user.created_at)',
        //             'date',
        //         )
        //         .addSelect(
        //             'COUNT(user.id)',
        //             'aggregate',
        //         )
        //         .where(
        //             'user.created_at >= :date',
        //             {
        //                 date: thirtyDaysAgo,
        //             },
        //         )
        //         .groupBy(
        //             'DATE(user.created_at)',
        //         )
        //         .orderBy(
        //             'date',
        //             'ASC',
        //         )
        //         .getRawMany();


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

                applicantsByMonth,

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


    // ============================================================
    // CANDIDATE COMPOSITION
    // ============================================================

    async candidateComposition(
        start?: string,
        end?: string,
    ) {

        const query =
            this.applicantRepository
                .createQueryBuilder('applicant')
                .select([
                    'applicant.id',
                    'applicant.picture',
                    'applicant.created_at',
                    'applicant.updated_at',
                ])
                .orderBy(
                    'applicant.created_at',
                    'ASC',
                );


        if (start) {

            query.andWhere(
                'DATE(applicant.created_at) >= :start',
                {
                    start,
                },
            );

        }


        if (end) {

            query.andWhere(
                'DATE(applicant.created_at) <= :end',
                {
                    end,
                },
            );

        }


        return {

            success: true,

            data:
                await query.getMany(),

        };
    }


    // ============================================================
    // LAST USER ACTIVITY
    // ============================================================

    async lastUserActivity(
        page = 1,
        limit = 10,
    ) {

        page =
            Math.max(
                page,
                1,
            );

        limit =
            Math.min(
                Math.max(
                    limit,
                    1,
                ),
                100,
            );


        const skip =
            (page - 1) * limit;


        const [
            users,
            total,
        ] =
            await this.userRepository
                .createQueryBuilder('user')
                .select([
                    'user.id',
                    'user.username',
                    'user.email',
                    'user.last_activity_at',
                    'user.role_id',
                ])
                .where(
                    'user.last_activity_at IS NOT NULL',
                )
                .orderBy(
                    'user.last_activity_at',
                    'DESC',
                )
                .skip(skip)
                .take(limit)
                .getManyAndCount();


        // ========================================================
        // USER LOGINS LAST MONTH
        // ========================================================

        const oneMonthAgo =
            new Date();

        oneMonthAgo.setMonth(
            oneMonthAgo.getMonth() - 1,
        );


        const userLogins =
            await this.userRepository
                .createQueryBuilder('user')
                .select(
                    'DATE(user.last_activity_at)',
                    'date',
                )
                .addSelect(
                    'COUNT(user.id)',
                    'users_logged_in',
                )
                .where(
                    'user.last_activity_at IS NOT NULL',
                )
                .andWhere(
                    'user.last_activity_at > :date',
                    {
                        date: oneMonthAgo,
                    },
                )
                .groupBy(
                    'DATE(user.last_activity_at)',
                )
                .orderBy(
                    'date',
                    'DESC',
                )
                .getRawMany();


        return {

            success: true,

            message:
                'User activity retrieved successfully',

            data: {

                users,

                userLogins,

            },

            pagination: {

                total,

                page,

                limit,

                totalPages:
                    Math.ceil(
                        total / limit,
                    ),

            },

        };
    }


    // ============================================================
    // PROFILE
    // ============================================================

    async profile(
        userId: number,
    ) {

        const user =
            await this.userRepository.findOne({

                where: {
                    id: userId,
                },

                relations: [
                    'client',
                ],

            });


        if (!user) {

            throw new NotFoundException(
                'User not found',
            );

        }


        if (!user.client_id) {

            throw new NotFoundException(
                'Client profile not found',
            );

        }


        return {

            success: true,

            message:
                'Profile retrieved successfully',

            data:
                user,

        };
    }


    // ============================================================
    // NOTIFICATIONS
    // ============================================================

    async notifications(
        userId: number,
        type: string,
    ) {

        const query =
            this.notificationRepository
                .createQueryBuilder('notification')
                .where(
                    'notification.user_id = :userId',
                    {
                        userId,
                    },
                );


        if (type === 'index') {

            const notifications =
                await query
                    .andWhere(
                        'notification.status = :status',
                        {
                            status: 'new',
                        },
                    )
                    .orderBy(
                        'notification.id',
                        'ASC',
                    )
                    .getMany();


            return {

                success: true,

                message:
                    'New notifications retrieved successfully',

                data:
                    notifications,

            };
        }


        if (type === 'archived') {

            const notifications =
                await query
                    .andWhere(
                        'notification.status = :status',
                        {
                            status: 'old',
                        },
                    )
                    .orderBy(
                        'notification.id',
                        'DESC',
                    )
                    .take(200)
                    .getMany();


            return {

                success: true,

                message:
                    'Archived notifications retrieved successfully',

                data:
                    notifications,

            };
        }


        if (type === 'acknowledge') {

            await this.notificationRepository
                .createQueryBuilder()
                .update(Notification)
                .set({
                    readed: true,
                })
                .where(
                    'user_id = :userId',
                    {
                        userId,
                    },
                )
                .andWhere(
                    'readed = :readed',
                    {
                        readed: false,
                    },
                )
                .execute();

            return {
                success: true,
                message:
                    'Notifications acknowledged successfully',
            };
        }


        throw new NotFoundException(
            'Invalid notification type',
        );
    }


    // ============================================================
    // VIEW NOTIFICATION
    // ============================================================

    async viewNotification(id: number) {

        const notification =
            await this.notificationRepository.findOne({
                where: {
                    id,
                },
            });

        if (!notification) {
            throw new NotFoundException(
                `Notification with ID ${id} not found`,
            );
        }

        notification.readed = true;

        await this.notificationRepository.save(
            notification,
        );

        return {
            success: true,
            message: 'Notification marked as read',
            data: notification,
        };
    }
}