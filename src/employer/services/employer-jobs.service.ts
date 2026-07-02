import { Injectable } from '@nestjs/common';
import { Jobs } from 'src/jobs/entities/job.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Users } from 'src/entities/users.entity';
import { InternalServerErrorException } from '@nestjs/common';

export type MyJobsQuery = {
  page?: number;
  limit?: number;
  search?: string;
  industryId?: number;
  status?: 'active' | 'expired' | 'today' | 'all';
  published?: 'published' | 'unpublished' | 'all';
};
@Injectable()
export class EmployerJobsService {
    constructor(
        @InjectRepository(Jobs)
        private readonly jobsRepository: Repository<Jobs>,
    ) { }

  async myjobs(user: Users, query: MyJobsQuery) {
  const {
    page = 1,
    limit = 20,
    search,
    industryId,
    status = 'all',
    published = 'all',
  } = query;
        try {
            const clientId = user?.client_id;

            if (!clientId) {
                return {
                    success: false,
                    message: 'No client assigned to this user',
                    data: [],
                };
            }

            const query = this.jobsRepository
                .createQueryBuilder('job')

                .leftJoinAndSelect('job.client', 'client')
                .leftJoinAndSelect('job.country', 'country')
                .leftJoinAndSelect('job.region', 'region')
                .leftJoinAndSelect('job.industry', 'industry')
                .leftJoinAndSelect('job.position', 'position')
                .leftJoinAndSelect('job.addresses', 'addresses')
                .leftJoinAndSelect('job.jobStatistics', 'jobStatistics')
                .leftJoinAndSelect('job.jobUniversalType', 'jobUniversalType')

                // 🔥 JOIN APPLICATIONS
                .leftJoin('job.applications', 'applications')

                .select([
                    'job.id',
                    'job.status',
                    'job.published',
                    'job.dead_line',
                    'job.quantity',
                    'job.featured',
                    'job.publish_date',
                    'job.created_at',
                    'job.updated_at',

                    'client.id',
                    'client.client_name',
                    'client.logo',

                    'position.id',
                    'position.position_name',

                    'jobStatistics.id',
                    'jobStatistics.job_views',
                ])

                // 🔥 TOTAL APPLICANTS
                .addSelect('COUNT(applications.id)', 'total_applicants')

                .where('client.id = :clientId', { clientId })
                .orderBy('job.id', 'DESC');
            if (status === 'active') {
                query.andWhere('DATE(job.dead_line) >= CURDATE()');
            }

            if (status === 'expired') {
                query.andWhere('job.dead_line < CURDATE()');
            }

            if (status === 'today') {
                query.andWhere('job.dead_line = CURDATE()');
            }

            if (published === 'published') {
                query.andWhere('job.published = :pub', { pub: '1' });
            }

            if (published === 'unpublished') {
                query.andWhere('job.published = :pub', { pub: '0' });
            }



            // ======================
            // SEARCH FILTER
            // ======================
            if (search && search.trim()) {
                const keyword = `%${search.trim()}%`;

                query.andWhere(
                    `(
          job.title LIKE :keyword OR
          client.client_name LIKE :keyword OR
          position.position_name LIKE :keyword
        )`,
                    { keyword },
                );
            }

            // ======================
            // INDUSTRY FILTER
            // ======================
            if (industryId) {
                query.andWhere('job.industry_id = :industryId', { industryId });
            }


            // ======================
            // GROUP BY (IMPORTANT FIX)
            // ======================
            query
                .groupBy('job.id')
                .addGroupBy('client.id')
                .addGroupBy('position.id')
                .addGroupBy('jobStatistics.id');

            // ======================
            // TOTAL COUNT
            // ======================
            const totalResult = await this.jobsRepository
                .createQueryBuilder('job')
                .leftJoin('job.client', 'client')
                .where('client.id = :clientId', { clientId })
                .select('COUNT(DISTINCT job.id)', 'count')
                .getRawOne();

            const total = Number(totalResult.count);
            const stats = await this.jobsRepository
                .createQueryBuilder('job')
                .leftJoin('job.client', 'client')
                .where('client.id = :clientId', { clientId })
                .select([
                    `COUNT(job.id) AS total_jobs`,

                    `SUM(CASE WHEN job.published = '1' THEN 1 ELSE 0 END) AS published_jobs`,
                    `SUM(CASE WHEN job.published = '0' THEN 1 ELSE 0 END) AS unpublished_jobs`,

                    `SUM(CASE WHEN job.dead_line >= CURDATE() THEN 1 ELSE 0 END) AS active_jobs`,
                    `SUM(CASE WHEN job.dead_line < CURDATE() THEN 1 ELSE 0 END) AS expired_jobs`,
                ])
                .getRawOne();
            // ======================
            // PAGINATION
            // ======================
            const jobs = await query
                .skip((page - 1) * limit)
                .take(limit)
                .getRawAndEntities(); // 🔥 IMPORTANT FIX

            // ======================
            // MERGE total_applicants INTO RESULT
            // ======================
            const formatted = jobs.entities.map((job, index) => {
                return {
                    ...job,
                    total_applicants: Number(jobs.raw[index]?.total_applicants || 0),
                };
            });

            return {
                success: true,
                message: 'My jobs fetched successfully',
                data: formatted,
                current_page: page,
                per_page: limit,
                total_pages: Math.ceil(total / limit),
                total,
                stats: {
                    total_jobs: Number(stats.total_jobs || 0),
                    published_jobs: Number(stats.published_jobs || 0),
                    unpublished_jobs: Number(stats.unpublished_jobs || 0),
                    active_jobs: Number(stats.active_jobs || 0),
                    expired_jobs: Number(stats.expired_jobs || 0),
                },
            };
        } catch (error) {
            throw new InternalServerErrorException({
                success: false,
                message: 'Failed to fetch jobs',
                error: error.message,
            });
        }
    }
}
