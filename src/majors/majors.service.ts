import { Injectable } from '@nestjs/common';
import { Majors } from 'src/entities/majors.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InternalServerErrorException } from '@nestjs/common';

@Injectable()
export class MajorsService {
      constructor(
    @InjectRepository(Majors)
    private readonly majorRepository: Repository<Majors>,
  ) {}

  async findAll(
    page = 1,
    limit = 20,
    search?: string,
  ) {
    try {
      const query = this.majorRepository
        .createQueryBuilder('major')
        .select([
          'major.id',
          'major.name',
        ])
        .orderBy('major.id', 'DESC');

      if (search) {
        query.where(
          'major.name LIKE :search',
          { search: `%${search}%` },
        );
      }

      const totalQuery = this.majorRepository
        .createQueryBuilder('major');

      if (search) {
        totalQuery.where(
          'major.name LIKE :search',
          { search: `%${search}%` },
        );
      }

      const totalResult = await totalQuery
        .select('COUNT(*)', 'count')
        .getRawOne();

      const total = Number(totalResult.count);

      const majors = await query
        .skip((page - 1) * limit)
        .take(limit)
        .getMany();

      const data = majors.map((major) => ({
        id: major.id,
        name: major.name,
      }));

      return {
        success: true,
        message: 'Majors fetched successfully',
        data,
        current_page: page,
        per_page: limit,
        total_pages: Math.ceil(total / limit),
        total,
      };
    } catch (error) {
      throw new InternalServerErrorException({
        success: false,
        message: 'Failed to fetch majors',
        error: error.message,
      });
    }
  }
}
