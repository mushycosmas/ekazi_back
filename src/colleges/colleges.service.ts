import { Injectable } from '@nestjs/common';
import { Colleges } from 'src/entities/colleges.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InternalServerErrorException } from '@nestjs/common';

@Injectable()
export class CollegesService {
   constructor(
    @InjectRepository(Colleges)
    private readonly collegeRepository: Repository<Colleges>,
  ) {}

  async findAll(
    page = 1,
    limit = 20,
    search?: string,
    regionId?: number,
  ) {
    try {
      const query = this.collegeRepository
        .createQueryBuilder('college')
        .select([
          'college.id',
          'college.college_name',
        ])
        .where('college.hide = :hide', { hide: false })
        .orderBy('college.id', 'DESC');

      if (regionId) {
        query.andWhere('college.region_id = :regionId', {
          regionId,
        });
      }

      if (search) {
        query.andWhere(
          'college.college_name LIKE :search',
          { search: `%${search}%` },
        );
      }

      const totalQuery = this.collegeRepository
        .createQueryBuilder('college')
        .where('college.hide = :hide', { hide: false });

      if (regionId) {
        totalQuery.andWhere('college.region_id = :regionId', {
          regionId,
        });
      }

      if (search) {
        totalQuery.andWhere(
          'college.college_name LIKE :search',
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

      // map to clean format
      const formatted = data.map((item) => ({
        id: item.id,
        college_name: item.college_name,
      }));

      return {
        success: true,
        message: 'Colleges fetched successfully',
        data: formatted,
        current_page: page,
        per_page: limit,
        total_pages: Math.ceil(total / limit),
        total,
      };
    } catch (error) {
      throw new InternalServerErrorException({
        success: false,
        message: 'Failed to fetch colleges',
        error: error.message,
      });
    }
  }
}
