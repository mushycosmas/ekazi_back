import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Tools } from 'src/entities/tools.entity';
import { Repository } from 'typeorm';
import { InternalServerErrorException } from '@nestjs/common';

@Injectable()
export class ToolsService {
      constructor(
    @InjectRepository(Tools)
    private readonly toolsRepository: Repository<Tools>,
  ) {}

  async findAll(
    page = 1,
    limit = 20,
    search?: string,
  ) {
    try {
      const query = this.toolsRepository
        .createQueryBuilder('tool')
        .select([
          'MIN(tool.id) as id',
          'tool.tool_name as tool_name',
        ])
        .groupBy('tool.tool_name')
        .orderBy('tool.id', 'DESC');

      if (search) {
        query.andWhere(
          'tool.tool_name LIKE :search',
          { search: `%${search}%` },
        );
      }

      const totalQuery = this.toolsRepository
        .createQueryBuilder('tool');

      if (search) {
        totalQuery.where(
          'tool.tool_name LIKE :search',
          { search: `%${search}%` },
        );
      }

      const totalResult = await totalQuery
        .select('COUNT(DISTINCT tool.tool_name)', 'count')
        .getRawOne();

      const total = Number(totalResult.count);

      const data = await query
        .offset((page - 1) * limit)
        .limit(limit)
        .getRawMany();

      return {
        success: true,
        message: 'Tools fetched successfully',
        data,
        current_page: page,
        per_page: limit,
        total_pages: Math.ceil(total / limit),
        total,
      };
    } catch (error) {
      throw new InternalServerErrorException({
        success: false,
        message: 'Failed to fetch tools',
        error: error.message,
      });
    }
  }
}
