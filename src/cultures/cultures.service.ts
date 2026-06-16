import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Cultures } from 'src/entities/cultures.entity';
import { Repository } from 'typeorm';
import { InternalServerErrorException } from '@nestjs/common';

@Injectable()
export class CulturesService {
      constructor(
    @InjectRepository(Cultures)
    private readonly cultureRepository: Repository<Cultures>,
  ) {}

  async findAll(
    page = 1,
    limit = 20,
    search?: string,
  ) {
    try {
      const query = this.cultureRepository
        .createQueryBuilder('culture')
        .select([
          'MIN(culture.id) as id',
          'culture.culture_name as culture_name',
        ])
        .groupBy('culture.culture_name')
        .orderBy('id', 'DESC');

      if (search) {
        query.andWhere(
          'culture.culture_name LIKE :search',
          { search: `%${search}%` },
        );
      }

      const totalQuery = this.cultureRepository
        .createQueryBuilder('culture');

      if (search) {
        totalQuery.where(
          'culture.culture_name LIKE :search',
          { search: `%${search}%` },
        );
      }

      const totalResult = await totalQuery
        .select('COUNT(DISTINCT culture.culture_name)', 'count')
        .getRawOne();

      const total = Number(totalResult.count);

      const data = await query
        .offset((page - 1) * limit)
        .limit(limit)
        .getRawMany();

      return {
        success: true,
        message: 'Cultures fetched successfully',
        data,
        current_page: page,
        per_page: limit,
        total_pages: Math.ceil(total / limit),
        total,
      };
    } catch (error) {
      throw new InternalServerErrorException({
        success: false,
        message: 'Failed to fetch cultures',
        error: error.message,
      });
    }
  }
}
