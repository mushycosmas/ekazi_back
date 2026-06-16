import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Softwares } from 'src/entities/softwares.entity';
import { Repository } from 'typeorm';
import { InternalServerErrorException } from '@nestjs/common';
 

@Injectable()
export class SoftwaresService {
      constructor(
    @InjectRepository(Softwares)
    private readonly softwareRepository: Repository<Softwares>,
  ) {}

  async findAll(
    page = 1,
    limit = 20,
    search?: string,
  ) {
    try {
      const query = this.softwareRepository
        .createQueryBuilder('software')
        .select([
          'MIN(software.id) as id',
          'software.software_name as software_name',
        ])
        .groupBy('software.software_name')
        .orderBy('id', 'DESC');

      if (search) {
        query.andWhere(
          'software.software_name LIKE :search',
          { search: `%${search}%` },
        );
      }

      const totalQuery = this.softwareRepository
        .createQueryBuilder('software');

      if (search) {
        totalQuery.where(
          'software.software_name LIKE :search',
          { search: `%${search}%` },
        );
      }

      const totalResult = await totalQuery
        .select('COUNT(DISTINCT software.software_name)', 'count')
        .getRawOne();

      const total = Number(totalResult.count);

      const data = await query
        .offset((page - 1) * limit)
        .limit(limit)
        .getRawMany();

      return {
        success: true,
        message: 'Softwares fetched successfully',
        data,
        current_page: page,
        per_page: limit,
        total_pages: Math.ceil(total / limit),
        total,
      };
    } catch (error) {
      throw new InternalServerErrorException({
        success: false,
        message: 'Failed to fetch softwares',
        error: error.message,
      });
    }
  }
}
