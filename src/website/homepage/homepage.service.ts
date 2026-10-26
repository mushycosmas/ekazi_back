

import {
    Injectable,
    InternalServerErrorException,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';

import { Jobs } from 'src/jobs/entities/job.entity';
import { Users } from 'src/entities/users.entity';
import { Clients } from 'src/client/clients.entity';


@Injectable()
export class HomepageService {
    constructor(
        @InjectRepository(Clients)
        private readonly clientRepository: Repository<Clients>,

        @InjectRepository(Users)
        private readonly userRepository: Repository<Users>,

        @InjectRepository(Jobs)
        private readonly jobRepository: Repository<Jobs>,

        private readonly dataSource: DataSource,
    ) { }

    /**
     * Featured employers
     * GET /api/homepage/featured-employers
     */
    async listFeaturedEmployers(page = 1, perPage = 10) {
        const currentPage = Math.max(1, Number(page) || 1);
        const limit = Math.min(100, Math.max(1, Number(perPage) || 10));

        const [employers, total] =
            await this.clientRepository.findAndCount({
                where: {
                    featured: 1,
                } as any,
                relations: [
                    'industry',
                    'addresses',
                    'addresses.region',
                    'addresses.region.country',
                ],
                order: {
                    created_at: 'DESC',
                    id: 'DESC',
                },
                skip: (currentPage - 1) * limit,
                take: limit,
            });

        const data = employers.map((employer: any) => ({
            ...employer,
            logo: employer.logo || null,
        }));

        return {
            success: true,
            message: 'Featured employers retrieved successfully.',
            data,
            total,
            page: currentPage,
            limit,
            totalPages: Math.ceil(total / limit),

        };
    }

    async employersDetail(id: number) {
        const employer = await this.clientRepository.findOne({
            where: {
                id,
            } as any,
            relations: [
                'industry',
                'emails',
                'phones',
                'addresses',
                'addresses.region',
                'addresses.region.country',
                'descriptions',
                'companySize',
                'type',
                'socialMedia',
                'socialMedia.social',
            ],
        });

        if (!employer) {
            throw new NotFoundException('Employer not found.');
        }

        const data: any = {
            ...employer,
            logo: employer.logo || null,

        };

        return {
            success: true,
            message: 'Employer details retrieved successfully.',
            data,
        };
    }

    /**
     * Platform statistics
     * GET /api/homepage/stats
     */
    async getStats() {
        const [employers, jobSeekers, jobPosts] = await Promise.all([
            this.userRepository.count({
                where: { role_id: 9 } as any,
            }),
            this.userRepository.count({
                where: { role_id: 12 } as any,
            }),
            this.jobRepository.count(),
        ]);

        return {
            success: true,
            data: {
                employers,
                job_seekers: jobSeekers,
                job_posts: jobPosts,
            },
        };
    }

    /**
     * Active job count grouped by industry and employer
     * GET /api/homepage/jobs-by-industry
     */
    async getJobsCountByIndustry() {
        const sql = `
      SELECT
        i.industry_name,
        c.id AS client_id,
        c.client_name,
        COUNT(j.id) AS job_count
      FROM clients c
      INNER JOIN jobs j
        ON j.client_id = c.id
        AND j.hide = 0
        AND j.published = 1
        AND j.dead_line >= CURDATE()
      LEFT JOIN industries i
        ON c.industry_id = i.id
      WHERE i.industry_name IS NOT NULL
      GROUP BY
        i.industry_name,
        c.id,
        c.client_name
      ORDER BY job_count DESC
    `;

        const rows = await this.dataSource.query(sql);

        return {
            success: true,
            message: 'Industry job counts retrieved successfully.',
            data: rows.map((row: any) => ({
                industry_name: row.industry_name,
                client_id: Number(row.client_id),
                client_name: row.client_name,
                job_count: Number(row.job_count),
            })),
        };
    }
}
