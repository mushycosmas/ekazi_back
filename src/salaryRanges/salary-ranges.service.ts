import { Injectable } from '@nestjs/common';
import { SalaryRanges } from 'src/entities/salary-ranges.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InternalServerErrorException } from '@nestjs/common';

@Injectable()
export class SalaryRangesService {
      constructor(
    @InjectRepository(SalaryRanges)
    private readonly salaryRepository: Repository<SalaryRanges>,
  ) {}

  async findAll(
    page = 1,
    limit = 20,
    search?: string,
  ) {
    try {
      const query = this.salaryRepository
        .createQueryBuilder('salary')
        .orderBy('salary.id', 'DESC');

      // Search (low or high)
      if (search) {
        query.andWhere(
          '(salary.low LIKE :search OR salary.high LIKE :search)',
          { search: `%${search}%` },
        );
      }

      const totalQuery = this.salaryRepository.createQueryBuilder('salary');

      if (search) {
        totalQuery.where(
          '(salary.low LIKE :search OR salary.high LIKE :search)',
          { search: `%${search}%` },
        );
      }

      const totalResult = await totalQuery
        .select('COUNT(*)', 'count')
        .getRawOne();

      const total = Number(totalResult.count);

      const data = await query
        .skip((page - 1) * limit)
        .take(limit)
        .getMany();

      // format response like "low - high"
      const formatted = data.map((item) => ({
        id: item.id,
        range: `${item.low} - ${item.high}`,
        low: item.low,
        high: item.high,
      }));

      return {
        success: true,
        message: 'Salary ranges fetched successfully',
        data: formatted,
        current_page: page,
        per_page: limit,
        total_pages: Math.ceil(total / limit),
        total,
      };
    } catch (error) {
      throw new InternalServerErrorException({
        success: false,
        message: 'Failed to fetch salary ranges',
        error: error.message,
      });
    }
  }
}
