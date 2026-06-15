import { Injectable } from '@nestjs/common';
import { Industries } from 'src/entities/industries.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InternalServerErrorException } from '@nestjs/common';

@Injectable()
export class IndustriesService {
     constructor(
    @InjectRepository(Industries)
    private readonly industryRepository: Repository<Industries>,
  ) {}

  async findAll(
    page = 1,
    limit = 20,
    search?: string,
  ) {
    try {
      const query = this.industryRepository
        .createQueryBuilder('industry')
        .select([
          'industry.id',
          'industry.industry_name',
        ])
        .orderBy('industry.id', 'DESC');

      if (search) {
        query.where(
          'industry.industry_name LIKE :search',
          { search: `%${search}%` },
        );
      }

      const totalQuery = this.industryRepository.createQueryBuilder('industry');

      if (search) {
        totalQuery.where(
          'industry.industry_name LIKE :search',
          { search: `%${search}%` },
        );
      }

      const totalResult = await totalQuery
        .select('COUNT(*)', 'count')
        .getRawOne();

      const total = Number(totalResult.count);

      const industries = await query
        .skip((page - 1) * limit)
        .take(limit)
        .getMany();

      const data = industries.map((industry) => ({
        id: industry.id,
        name: industry.industry_name,
      }));

      return {
        success: true,
        message: 'Industries fetched successfully',
        data,
        current_page: page,
        per_page: limit,
        total_pages: Math.ceil(total / limit),
        total,
      };
    } catch (error) {
      throw new InternalServerErrorException({
        success: false,
        message: 'Failed to fetch industries',
        error: error.message,
      });
    }
  }
}
