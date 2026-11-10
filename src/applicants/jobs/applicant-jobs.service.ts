
import {
    Injectable,
    NotFoundException,
    ConflictException,
    BadRequestException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { JobLikes } from 'src/jobs/entities/job-likes.entity';
import { JobsService } from 'src/jobs/jobs.service';

import { CreateApplicantSaveJobDto } from
    './dto/create-applicant-save-job.dto';
import { Jobs } from 'src/jobs/entities/job.entity';
import { ApplicantApplication } from 'src/entities/applicants/applicant-applicantions.entity';
import { Applicants } from 'src/entities/applicants/applicants.entity';
import { JobCarts } from 'src/jobs/entities/job-carts.entity';


@Injectable()
export class ApplicantJobsService {
    constructor(
        @InjectRepository(JobLikes)
        private readonly savedJobsRepo: Repository<JobLikes>,

        private readonly jobsService: JobsService,
        @InjectRepository(Jobs)
        private readonly jobsRepository: Repository<Jobs>,
        @InjectRepository(ApplicantApplication)
        private readonly applicationRepository: Repository<ApplicantApplication>,
        @InjectRepository(Applicants)
        private readonly applicantsRepository: Repository<Applicants>,
        @InjectRepository(JobCarts)
        private readonly jobCartsRepository: Repository<JobCarts>,

    ) { }

    // Like a job for the authenticated user.

    async saveJob(
        userId: number,
        dto: CreateApplicantSaveJobDto,
    ) {
        const applicant = await this.applicantsRepository.findOne({
            select: { id: true },
            where: { user_id: userId },
        });

        if (!applicant) {
            throw new NotFoundException('Applicant profile not found');
        }

        const jobResponse = await this.jobsService.findOne(dto.job_id);
        const job = jobResponse.data;

        const existing = await this.jobCartsRepository.findOne({
            where: {
                applicant_id: applicant.id,
                job_id: dto.job_id,
            },
        });

        if (existing) {
            return {
                success: true,
                message: 'This job is already in your cart',
                data: {
                    id: existing.id,
                    applicant_id: existing.applicant_id,
                    job_id: existing.job_id,
                    created_at: existing.created_at,
                    updated_at: existing.updated_at,
                    job,
                },
            };
        }

        const cartItem = this.jobCartsRepository.create({
            applicant_id: applicant.id,
            job_id: dto.job_id,
        });

        try {
            const saved = await this.jobCartsRepository.save(cartItem);

            return {
                success: true,
                message: 'Job added to cart successfully',
                data: {
                    id: saved.id,
                    applicant_id: saved.applicant_id,
                    job_id: saved.job_id,
                    created_at: saved.created_at,
                    updated_at: saved.updated_at,
                    job,
                },
            };
        } catch (error) {
            if (error.code === 'ER_DUP_ENTRY') {
                throw new ConflictException('This job is already in your cart');
            }

            throw error;
        }
    }

    async findAll(
        userId: number,
        page = 1,
        limit = 10,
        search?: string,
    ) {
        const currentPage = Math.max(1, Number(page) || 1);
        const perPage = Math.min(100, Math.max(1, Number(limit) || 10));

        const applicant = await this.applicantsRepository.findOne({
            select: { id: true },
            where: { user_id: userId },
        });

        if (!applicant) {
            throw new NotFoundException('Applicant profile not found');
        }

        const query = this.jobCartsRepository
            .createQueryBuilder('cart')
            .innerJoinAndSelect('cart.job', 'job')
            .leftJoinAndSelect('job.client', 'client')
            .leftJoinAndSelect('job.position', 'position')
            .leftJoinAndSelect('job.country', 'country')
            .leftJoinAndSelect('job.region', 'region')
            .leftJoinAndSelect('job.addresses', 'addresses')
            .leftJoinAndSelect('job.jobStatistics', 'jobStatistics')
            .leftJoinAndSelect('job.jobUniversalType', 'jobUniversalType')
            .where('cart.applicant_id = :applicantId', {
                applicantId: applicant.id,
            })
            .select([
                // =========================
                // CART
                // =========================
                'cart.id',
                'cart.applicant_id',
                'cart.job_id',
                'cart.created_at',

                // =========================
                // JOB
                // =========================
                'job.id',
                'job.title',
                'job.publish_date',
                'job.created_at',
                'job.dead_line',
                'job.published',
                'job.status',

                // =========================
                // COMPANY
                // =========================
                'client.id',
                'client.client_name',
                'client.logo',

                // =========================
                // POSITION
                // =========================
                'position.id',
                'position.position_name',

                // =========================
                // COUNTRY
                // =========================
                'country.id',
                'country.name',

                // =========================
                // REGION
                // =========================
                'region.id',
                'region.region_name',

                // =========================
                // ADDRESS / LOCATION
                // =========================
                'addresses.id',
                'addresses.sub_location',

                // =========================
                // JOB STATISTICS
                // =========================
                'jobStatistics.id',
                'jobStatistics.job_views',

                // =========================
                // JOB TYPE
                // =========================
                'jobUniversalType.id',
                'jobUniversalType.type_name',
            ]);

        // =========================
        // SEARCH
        // =========================
        if (search?.trim()) {
            query.andWhere(
                `(
                job.title LIKE :search
                OR position.position_name LIKE :search
                OR client.client_name LIKE :search
                OR country.name LIKE :search
                OR region.region_name LIKE :search
                OR addresses.sub_location LIKE :search
                OR jobUniversalType.type_name LIKE :search
            )`,
                {
                    search: `%${search.trim()}%`,
                },
            );
        }

        // =========================
        // PAGINATION
        // =========================
        const [items, total] = await query
            .orderBy('cart.id', 'DESC')
            .skip((currentPage - 1) * perPage)
            .take(perPage)
            .getManyAndCount();

        // =========================
        // TODAY
        // =========================
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // =========================
        // FORMAT DATA
        // =========================
        const data = items.map((item) => {
            const job = item.job;

            const deadline = job.dead_line
                ? new Date(job.dead_line)
                : null;

            const status =
                Number(job.published) === 1 &&
                    deadline !== null &&
                    !Number.isNaN(deadline.getTime()) &&
                    deadline >= today
                    ? 'Open'
                    : 'Closed';

            return {
                // =========================
                // CART
                // =========================
                cart_id: item.id,

                // =========================
                // JOB
                // =========================
                job_id: job.id,
                title: job.title,

                // =========================
                // POSITION
                // =========================
                position: job.position?.position_name?.trim() ?? null,

                // =========================
                // COMPANY
                // =========================
                company: job.client?.client_name ?? null,
                company_logo: job.client?.logo ?? null,

                // =========================
                // DATE
                // =========================
                posted_on:
                    job.publish_date ||
                    job.created_at ||
                    null,

                deadline: job.dead_line ?? null,

                // =========================
                // STATUS
                // =========================
                status,

                // =========================
                // JOB TYPE
                // =========================
                job_type: job.jobUniversalType
                    ? {
                        id: job.jobUniversalType.id,
                        name: job.jobUniversalType.type_name,
                    }
                    : null,

                // =========================
                // VIEW COUNT
                // =========================
                view_count: job.jobStatistics?.[0]?.job_views ?? 0,

                // =========================
                // LOCATION
                // =========================
                location: {
                    country: job.country
                        ? {
                            id: job.country.id,
                            name: job.country.name,
                        }
                        : null,

                    region: job.region
                        ? {
                            id: job.region.id,
                            name: job.region.region_name,
                        }
                        : null,

                    addresses: (job.addresses || []).map(
                        (address) => ({
                            id: address.id,
                            sub_location:
                                address.sub_location,
                        }),
                    ),
                },

                // =========================
                // CART DATE
                // =========================
                added_at: item.created_at,
            };
        });

        return {
            success: true,
            message: 'Job cart retrieved successfully',
            data,
            total,
            page: currentPage,
            limit: perPage,
            totalPages: Math.ceil(total / perPage),
        };
    }


    // async findAll(
    //     userId: number,
    //     page = 1,
    //     limit = 10,
    //     search?: string,
    // ) {
    //     const currentPage = Math.max(1, Number(page) || 1);
    //     const perPage = Math.min(100, Math.max(1, Number(limit) || 10));

    //     const applicant = await this.applicantsRepository.findOne({
    //         select: { id: true },
    //         where: { user_id: userId },
    //     });

    //     if (!applicant) {
    //         throw new NotFoundException('Applicant profile not found');
    //     }

    //     const query = this.jobCartsRepository
    //         .createQueryBuilder('cart')
    //         .innerJoinAndSelect('cart.job', 'job')
    //         .leftJoinAndSelect('job.client', 'client')
    //         .leftJoinAndSelect('job.position', 'position')
    //         .where('cart.applicant_id = :applicantId', {
    //             applicantId: applicant.id,
    //         })
    //         .select([
    //             'cart.id',
    //             'cart.applicant_id',
    //             'cart.job_id',
    //             'cart.created_at',

    //             'job.id',
    //             'job.title',
    //             'job.publish_date',
    //             'job.created_at',
    //             'job.dead_line',
    //             'job.published',
    //             'job.status',

    //             'client.id',
    //             'client.client_name',
    //             'client.logo',

    //             'position.id',
    //             'position.position_name',
    //         ]);

    //     if (search?.trim()) {
    //         query.andWhere(
    //             `(
    //     job.title LIKE :search
    //     OR position.position_name LIKE :search
    //     OR client.client_name LIKE :search
    //   )`,
    //             { search: `%${search.trim()}%` },
    //         );
    //     }

    //     const [items, total] = await query
    //         .orderBy('cart.id', 'DESC')
    //         .skip((currentPage - 1) * perPage)
    //         .take(perPage)
    //         .getManyAndCount();

    //     const today = new Date();
    //     today.setHours(0, 0, 0, 0);

    //     const data = items.map((item) => {
    //         const job = item.job;
    //         const deadline = job.dead_line
    //             ? new Date(job.dead_line)
    //             : null;

    //         const status =
    //             Number(job.published) === 1 &&
    //                 deadline !== null &&
    //                 !Number.isNaN(deadline.getTime()) &&
    //                 deadline >= today
    //                 ? 'Open'
    //                 : 'Closed';

    //         return {
    //             cart_id: item.id,
    //             job_id: job.id,
    //             title: job.title,
    //             position: job.position?.position_name?.trim() ?? null,
    //             company: job.client?.client_name ?? null,
    //             company_logo: job.client?.logo ?? null,
    //             posted_on: job.publish_date || job.created_at || null,
    //             deadline: job.dead_line ?? null,
    //             status,
    //             added_at: item.created_at,
    //         };
    //     });

    //     return {
    //         success: true,
    //         message: 'Job cart retrieved successfully',
    //         data,
    //         total,
    //         page: currentPage,
    //         limit: perPage,
    //         totalPages: Math.ceil(total / perPage),
    //     };
    // }



    // Check whether the authenticated user likes a particular job.
    async checkSavedJob(userId: number, jobId: number) {
        const applicant = await this.applicantsRepository.findOne({
            select: { id: true },
            where: { user_id: userId },
        });

        if (!applicant) {
            throw new NotFoundException('Applicant profile not found');
        }

        const cartItem = await this.jobCartsRepository.findOne({
            where: {
                applicant_id: applicant.id,
                job_id: jobId,
            },
        });

        return {
            success: true,
            message: 'Job cart status retrieved successfully',
            data: {
                job_id: jobId,
                in_cart: !!cartItem,
                cart_id: cartItem?.id ?? null,
            },
        };
    }

    // Unlike a job using its job_id.
    async removeSavedJob(userId: number, jobId: number) {
        const applicant = await this.applicantsRepository.findOne({
            select: { id: true },
            where: { user_id: userId },
        });

        if (!applicant) {
            throw new NotFoundException('Applicant profile not found');
        }

        const cartItem = await this.jobCartsRepository.findOne({
            where: {
                applicant_id: applicant.id,
                job_id: jobId,
            },
        });

        if (!cartItem) {
            throw new NotFoundException('Job not found in your cart');
        }

        await this.jobCartsRepository.remove(cartItem);

        return {
            success: true,
            message: 'Job removed from cart successfully',
            data: {
                job_id: jobId,
                in_cart: false,
            },
        };
    }

async myApplication(
    userId: number,
    page = 1,
    limit = 20,
    search?: string,
) {
    const currentPage = Math.max(1, Number(page) || 1);
    const perPage = Math.min(100, Math.max(1, Number(limit) || 20));

    // =========================================================
    // 1. FIND APPLICANT
    // =========================================================
    const applicant = await this.applicantsRepository.findOne({
        where: { user_id: userId },
    });

    if (!applicant) {
        throw new BadRequestException(
            `No applicant profile found for user ID ${userId}`,
        );
    }

    const applicantId = applicant.id;

    // =========================================================
    // 2. BUILD APPLICATION QUERY
    // =========================================================
    const query = this.applicationRepository
        .createQueryBuilder('application')

        .innerJoinAndSelect(
            'application.job',
            'job',
        )

        .leftJoinAndSelect(
            'job.client',
            'client',
        )

        .leftJoinAndSelect(
            'job.position',
            'position',
        )

        .leftJoinAndSelect(
            'job.addresses',
            'addresses',
        )

        .leftJoinAndSelect(
            'job.country',
            'country',
        )

        .leftJoinAndSelect(
            'job.region',
            'region',
        )

        // Job statistics / views
        .leftJoinAndSelect(
            'job.jobStatistics',
            'jobStatistics',
        )

        // Job type
        .leftJoinAndSelect(
            'job.jobUniversalType',
            'jobUniversalType',
        )

        .where(
            'application.applicant_id = :applicantId',
            {
                applicantId,
            },
        )

        // =======================================================
        // 3. SELECT ONLY REQUIRED FIELDS
        // =======================================================
        .select([
            // Application
            'application.id',
            'application.applicant_id',
            'application.job_id',
            'application.status',
            'application.created_at',

            // Job
            'job.id',
            'job.title',
            'job.publish_date',
            'job.created_at',
            'job.dead_line',
            'job.published',

            // Client
            'client.id',
            'client.client_name',
            'client.logo',

            // Position
            'position.id',
            'position.position_name',

            // Addresses
            'addresses.id',
            'addresses.sub_location',

            // Country
            'country.id',
            'country.name',

            // Region
            'region.id',
            'region.region_name',

            // Statistics
            'jobStatistics.id',
            'jobStatistics.job_views',

            // Job Type
            'jobUniversalType.id',
            'jobUniversalType.type_name',
        ]);

    // =========================================================
    // 4. SEARCH
    // =========================================================
    if (search?.trim()) {
        query.andWhere(
            `(
                job.title LIKE :search
                OR position.position_name LIKE :search
                OR client.client_name LIKE :search
                OR country.name LIKE :search
                OR region.region_name LIKE :search
                OR addresses.sub_location LIKE :search
                OR jobUniversalType.type_name LIKE :search
            )`,
            {
                search: `%${search.trim()}%`,
            },
        );
    }

    // =========================================================
    // 5. PAGINATION
    // =========================================================
    query
        .orderBy('application.id', 'DESC')
        .skip((currentPage - 1) * perPage)
        .take(perPage);

    const [applications, total] =
        await query.getManyAndCount();

    // =========================================================
    // 6. RESPONSE
    // =========================================================
    return {
        success: true,

        message:
            'My applications retrieved successfully',

        data: applications.map(
            (application) => {
                const job = application.job;

                return {
                    application_id:
                        application.id,

                    applicant_id:
                        application.applicant_id,

                    job_id:
                        application.job_id,

                    application_status:
                        application.status,

                    applied_at:
                        application.created_at,

                    job: job
                        ? {
                            // =========================
                            // JOB
                            // =========================
                            id: job.id,

                            title: job.title,

                            posted_on:
                                job.publish_date ||
                                job.created_at ||
                                null,

                            // =========================
                            // DEADLINE
                            // =========================
                            deadline:
                                job.dead_line ?? null,

                            published:
                                job.published,

                            // =========================
                            // COMPANY
                            // =========================
                            company:
                                job.client?.client_name ??
                                null,

                            company_logo:
                                job.client?.logo ??
                                null,

                            // =========================
                            // POSITION
                            // =========================
                            position:
                                job.position
                                    ?.position_name
                                    ?.trim() ??
                                null,

                            // =========================
                            // VIEW COUNT
                            // =========================
                            view_count:
                                job.jobStatistics?.[0]
                                    ?.job_views ?? 0,

                            // =========================
                            // JOB TYPE
                            // =========================
                            job_type:
                                job.jobUniversalType
                                    ? {
                                        id: job
                                            .jobUniversalType
                                            .id,

                                        name:
                                            job
                                                .jobUniversalType
                                                .type_name,
                                    }
                                    : null,

                            // =========================
                            // LOCATION
                            // =========================
                            location: {
                                country:
                                    job.country
                                        ? {
                                            id:
                                                job
                                                    .country
                                                    .id,

                                            name:
                                                job
                                                    .country
                                                    .name,
                                        }
                                        : null,

                                region:
                                    job.region
                                        ? {
                                            id:
                                                job
                                                    .region
                                                    .id,

                                            name:
                                                job
                                                    .region
                                                    .region_name,
                                        }
                                        : null,

                                addresses:
                                    (
                                        job.addresses ||
                                        []
                                    ).map(
                                        (address) => ({
                                            id:
                                                address.id,

                                            sub_location:
                                                address.sub_location,
                                        }),
                                    ),
                            },
                        }
                        : null,
                };
            },
        ),

        total,

        page:
            currentPage,

        limit:
            perPage,

        totalPages:
            Math.ceil(
                total / perPage,
            ),
    };
}

    // async myApplication(
    //     userId: number,
    //     page = 1,
    //     limit = 20,
    //     search?: string,
    // ) {
    //     const currentPage = Math.max(1, Number(page) || 1);
    //     const perPage = Math.min(100, Math.max(1, Number(limit) || 20));

    //     // =========================================================
    //     // 1. FIND APPLICANT
    //     // =========================================================
    //     const applicant = await this.applicantsRepository.findOne({
    //         where: { user_id: userId },
    //     });

    //     if (!applicant) {
    //         throw new BadRequestException(
    //             `No applicant profile found for user ID ${userId}`,
    //         );
    //     }

    //     const applicantId = applicant.id;

    //     // =========================================================
    //     // 2. BUILD APPLICATION QUERY
    //     // =========================================================
    //     const query = this.applicationRepository
    //         .createQueryBuilder('application')

    //         .innerJoinAndSelect(
    //             'application.job',
    //             'job',
    //         )

    //         .leftJoinAndSelect(
    //             'job.client',
    //             'client',
    //         )

    //         .leftJoinAndSelect(
    //             'job.position',
    //             'position',
    //         )

    //         .leftJoinAndSelect(
    //             'job.addresses',
    //             'addresses',
    //         )

    //         .leftJoinAndSelect(
    //             'job.country',
    //             'country',
    //         )

    //         .leftJoinAndSelect(
    //             'job.region',
    //             'region',
    //         )

    //         .where(
    //             'application.applicant_id = :applicantId',
    //             {
    //                 applicantId,
    //             },
    //         )

    //         // =======================================================
    //         // 3. SELECT ONLY REQUIRED FIELDS
    //         // =======================================================
    //         .select([
    //             // Application
    //             'application.id',
    //             'application.applicant_id',
    //             'application.job_id',
    //             'application.status',
    //             'application.created_at',

    //             // Job
    //             'job.id',
    //             'job.title',
    //             'job.publish_date',
    //             'job.created_at',
    //             'job.dead_line',
    //             'job.published',

    //             // Client
    //             'client.id',
    //             'client.client_name',
    //             'client.logo',

    //             // Position
    //             'position.id',
    //             'position.position_name',

    //             // Addresses
    //             'addresses.id',
    //             'addresses.sub_location',

    //             // Country
    //             'country.id',
    //             'country.name',

    //             // Region
    //             'region.id',
    //             'region.region_name',
    //         ]);

    //     // =========================================================
    //     // 4. SEARCH
    //     // =========================================================
    //     if (search?.trim()) {
    //         query.andWhere(
    //             `(
    //     job.title LIKE :search
    //     OR position.position_name LIKE :search
    //     OR client.client_name LIKE :search
    //   )`,
    //             {
    //                 search: `%${search.trim()}%`,
    //             },
    //         );
    //     }

    //     // =========================================================
    //     // 5. PAGINATION
    //     // =========================================================
    //     query
    //         .orderBy('application.id', 'DESC')
    //         .skip((currentPage - 1) * perPage)
    //         .take(perPage);

    //     const [applications, total] =
    //         await query.getManyAndCount();

    //     // =========================================================
    //     // 6. RESPONSE
    //     // =========================================================
    //     return {
    //         success: true,

    //         message:
    //             'My applications retrieved successfully',

    //         data: applications.map(
    //             (application) => {
    //                 const job = application.job;

    //                 return {
    //                     application_id: application.id,

    //                     applicant_id:
    //                         application.applicant_id,

    //                     job_id:
    //                         application.job_id,

    //                     application_status:
    //                         application.status,

    //                     applied_at:
    //                         application.created_at,

    //                     job: job
    //                         ? {
    //                             id: job.id,

    //                             title: job.title,

    //                             posted_on:
    //                                 job.publish_date ||
    //                                 job.created_at ||
    //                                 null,

    //                             deadline:
    //                                 job.dead_line,

    //                             published:
    //                                 job.published,

    //                             company:
    //                                 job.client?.client_name ??
    //                                 null,

    //                             company_logo:
    //                                 job.client?.logo ??
    //                                 null,

    //                             position:
    //                                 job.position?.position_name ??
    //                                 null,

    //                             country: job.country
    //                                 ? {
    //                                     id: job.country.id,
    //                                     name: job.country.name,
    //                                 }
    //                                 : null,

    //                             region: job.region
    //                                 ? {
    //                                     id: job.region.id,
    //                                     name: job.region.region_name,
    //                                 }
    //                                 : null,

    //                             addresses:
    //                                 (job.addresses || []).map(
    //                                     (address) => ({
    //                                         id: address.id,

    //                                         sub_location:
    //                                             address.sub_location,

    //                                         region:
    //                                             address.region
    //                                                 ?.region_name ??
    //                                             null,
    //                                     }),
    //                                 ),
    //                         }
    //                         : null,
    //                 };
    //             },
    //         ),

    //         total,

    //         page: currentPage,

    //         limit: perPage,

    //         totalPages:
    //             Math.ceil(total / perPage),
    //     };
    // }


}