import { Injectable } from '@nestjs/common';
import { Positions } from 'src/entities/positions.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InternalServerErrorException } from '@nestjs/common';

@Injectable()
export class PositionsService {
     constructor(
    @InjectRepository(Positions)
    private readonly positionRepository: Repository<Positions>,
  ) {}

  async findAll(
    page = 1,
    limit = 20,
    search?: string,
  ) {
    try {
      const query = this.positionRepository
        .createQueryBuilder('position')
        .select([
          'position.id',
          'position.position_name',
        ])
        .orderBy('position.id', 'DESC');

      if (search) {
        query.where(
          'position.position_name LIKE :search',
          { search: `%${search}%` },
        );
      }

      const totalQuery = this.positionRepository
        .createQueryBuilder('position');

      if (search) {
        totalQuery.where(
          'position.position_name LIKE :search',
          { search: `%${search}%` },
        );
      }

      const totalResult = await totalQuery
        .select('COUNT(*)', 'count')
        .getRawOne();

      const total = Number(totalResult.count);

      const positions = await query
        .skip((page - 1) * limit)
        .take(limit)
        .getMany();

      const data = positions.map((position) => ({
        id: position.id,
        name: position.position_name,
      }));

      return {
        success: true,
        message: 'Positions fetched successfully',
        data,
        current_page: page,
        per_page: limit,
        total_pages: Math.ceil(total / limit),
        total,
      };
    } catch (error) {
      throw new InternalServerErrorException({
        success: false,
        message: 'Failed to fetch positions',
        error: error.message,
      });
    }
  }
}
