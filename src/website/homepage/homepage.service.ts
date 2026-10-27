

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
    /**
     * Active job count grouped by industry
     * GET /api/jobs/jobs-by-industry
     */
    async getJobsCountByIndustry() {
        const sql = `
        SELECT
            i.id AS industry_id,
            i.industry_name,
            COUNT(j.id) AS total_positions
        FROM jobs j
        INNER JOIN clients c
            ON j.client_id = c.id
        INNER JOIN industries i
            ON c.industry_id = i.id
        WHERE
            j.hide = 0
            AND j.published = 1
            AND j.dead_line >= CURDATE()
        GROUP BY
            i.id,
            i.industry_name
        ORDER BY
            total_positions DESC
    `;

        const rows = await this.dataSource.query(sql);

        return {
            success: true,
            message: 'Job counts by industry retrieved successfully.',
            data: rows.map((row: any) => ({
                industry_id: Number(row.industry_id),
                industry_name: row.industry_name,
                total_positions: Number(row.total_positions),
            })),
        };
    }
    /**
 * Active job count grouped by region
 * GET /api/homepage/jobs-by-region
 */
    async getJobCountByRegion() {
        const sql = `
    SELECT
      r.id AS region_id,
      r.region_name,
      COUNT(j.id) AS total_positions
    FROM jobs j
    INNER JOIN regions r
      ON j.region_id = r.id
    WHERE
      j.hide = 0
      AND j.published = 1
      AND j.dead_line >= CURDATE()
    GROUP BY
      r.id,
      r.region_name
    ORDER BY
      total_positions DESC
  `;

        const rows = await this.dataSource.query(sql);

        return {
            success: true,
            message: 'Job counts by region retrieved successfully.',
            data: rows.map((row: any) => ({
                region_id: Number(row.region_id),
                region_name: row.region_name,
                total_positions: Number(row.total_positions),
            })),
        };
    }
    
    async jobCountByCategory() {
        const sql = `
    SELECT
      i.id AS category_id,
      i.industry_name AS category_name,
      COUNT(j.id) AS total_positions
    FROM industries i
    INNER JOIN clients c
      ON c.industry_id = i.id
    INNER JOIN jobs j
      ON j.client_id = c.id
    WHERE
      j.hide = 0
      AND j.published = 1
      AND j.dead_line >= CURDATE()
    GROUP BY
      i.id,
      i.industry_name
    ORDER BY
      total_positions DESC
  `;

        const rows = await this.dataSource.query(sql);

        return {
            success: true,
            message: 'Job counts by category retrieved successfully.',
            data: rows.map((row: any) => ({
                category_id: Number(row.category_id),
                category_name: row.category_name,
                total_positions: Number(row.total_positions),
            })),
        };
    }
}
