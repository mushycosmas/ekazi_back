import { Injectable } from '@nestjs/common';
import { EducationLevels } from 'src/entities/education-levels.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InternalServerErrorException } from '@nestjs/common';

@Injectable()
export class EducationLevelsService {
  constructor(
    @InjectRepository(EducationLevels)
    private readonly educationRepository: Repository<EducationLevels>,
  ) {}

  async findAll(
    page = 1,
    limit = 20,
    search?: string,
    industryId?: number,
  ) {
    try {
      const query = this.educationRepository
        .createQueryBuilder('education')
        .orderBy('education.id', 'DESC');

      if (industryId) {
        query.andWhere('education.industry_id = :industryId', {
          industryId,
        });
      }

      if (search) {
        query.andWhere(
          'education.education_level LIKE :search',
          { search: `%${search}%` },
        );
      }

      const totalQuery = this.educationRepository.createQueryBuilder('education');

      if (industryId) {
        totalQuery.andWhere('education.industry_id = :industryId', {
          industryId,
        });
      }

      if (search) {
        totalQuery.andWhere(
          'education.education_level LIKE :search',
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

      // REMOVE timestamps here
      const formatted = data.map((item) => ({
        id: item.id,
        industry_id: item.industry_id,
        education_level: item.education_level,
      }));

      return {
        success: true,
        message: 'Education levels fetched successfully',
        data: formatted,
        current_page: page,
        per_page: limit,
        total_pages: Math.ceil(total / limit),
        total,
      };
    } catch (error) {
      throw new InternalServerErrorException({
        success: false,
        message: 'Failed to fetch education levels',
        error: error.message,
      });
    }
  }
}
