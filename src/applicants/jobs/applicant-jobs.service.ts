
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
            .where('cart.applicant_id = :applicantId', {
                applicantId: applicant.id,
            })
            .select([
                'cart.id',
                'cart.applicant_id',
                'cart.job_id',
                'cart.created_at',

                'job.id',
                'job.title',
                'job.publish_date',
                'job.created_at',
                'job.dead_line',
                'job.published',
                'job.status',

                'client.id',
                'client.client_name',
                'client.logo',

                'position.id',
                'position.position_name',
            ]);

        if (search?.trim()) {
            query.andWhere(
                `(
        job.title LIKE :search
        OR position.position_name LIKE :search
        OR client.client_name LIKE :search
      )`,
                { search: `%${search.trim()}%` },
            );
        }

        const [items, total] = await query
            .orderBy('cart.id', 'DESC')
            .skip((currentPage - 1) * perPage)
            .take(perPage)
            .getManyAndCount();

        const today = new Date();
        today.setHours(0, 0, 0, 0);

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
                cart_id: item.id,
                job_id: job.id,
                title: job.title,
                position: job.position?.position_name?.trim() ?? null,
                company: job.client?.client_name ?? null,
                company_logo: job.client?.logo ?? null,
                posted_on: job.publish_date || job.created_at || null,
                deadline: job.dead_line ?? null,
                status,
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
        const perPage = Math.min(100, Math.max(1, Number(limit) || 10));

        // Resolve the applicant profile using the authenticated user's ID.
        const applicant = await this.applicantsRepository.findOne({
            where: { user_id: userId },
        });

        if (!applicant) {
            throw new BadRequestException(
                `No applicant profile found for user ID ${userId}`,
            );
        }

        const applicantId = applicant.id;

        const query = this.applicationRepository
            .createQueryBuilder('application')
            .innerJoinAndSelect('application.job', 'job')
            .leftJoinAndSelect('job.client', 'client')
            .leftJoinAndSelect('job.position', 'position')
            .where('application.applicant_id = :applicantId', {
                applicantId,
            })
            .select([
                'application.id',
                'application.applicant_id',
                'application.job_id',
                'application.status',
                'application.created_at',

                'job.id',
                'job.title',
                'job.publish_date',
                'job.created_at',
                'job.dead_line',
                'job.published',

                'client.id',
                'client.client_name',
                'client.logo',

                'position.id',
                'position.position_name',
            ]);

        if (search?.trim()) {
            query.andWhere(
                `(
        job.title LIKE :search
        OR position.position_name LIKE :search
        OR client.client_name LIKE :search
      )`,
                { search: `%${search.trim()}%` },
            );
        }

        query
            .orderBy('application.id', 'DESC')
            .skip((currentPage - 1) * perPage)
            .take(perPage);

        const [applications, total] = await query.getManyAndCount();

        return {
            success: true,
            message: 'My applications retrieved successfully',

            data: applications.map((application) => ({
                application_id: application.id,
                applicant_id: application.applicant_id,
                job_id: application.job_id,
                application_status: application.status,
                applied_at: application.created_at,

                job: application.job
                    ? {
                        id: application.job.id,
                        title: application.job.title,
                        posted_on:
                            application.job.publish_date ||
                            application.job.created_at ||
                            null,
                        deadline: application.job.dead_line,
                        published: application.job.published,
                        company: application.job.client?.client_name ?? null,
                        company_logo: application.job.client?.logo ?? null,
                        position:
                            application.job.position?.position_name ?? null,
                    }
                    : null,
            })),
            total,
            page: currentPage,
            limit: perPage,
            totalPages: Math.ceil(total / perPage),
        };
    }


}