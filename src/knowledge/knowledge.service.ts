import { Injectable } from '@nestjs/common';
import { Knowledge } from 'src/entities/knowledge.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InternalServerErrorException } from '@nestjs/common';

@Injectable()
export class KnowledgeService {
      constructor(
    @InjectRepository(Knowledge)
    private readonly knowledgeRepository: Repository<Knowledge>,
  ) {}

  async findAll(
    page = 1,
    limit = 20,
    search?: string,
  ) {
    try {
      const query = this.knowledgeRepository
        .createQueryBuilder('knowledge')
        .select([
          'knowledge.id',
          'knowledge.knowledge_name',
        ])
        .orderBy('knowledge.id', 'DESC');

      if (search) {
        query.where(
          'knowledge.knowledge_name LIKE :search',
          { search: `%${search}%` },
        );
      }

      const totalQuery = this.knowledgeRepository
        .createQueryBuilder('knowledge');

      if (search) {
        totalQuery.where(
          'knowledge.knowledge_name LIKE :search',
          { search: `%${search}%` },
        );
      }

      const totalResult = await totalQuery
        .select('COUNT(*)', 'count')
        .getRawOne();

      const total = Number(totalResult.count);

      const knowledge = await query
        .skip((page - 1) * limit)
        .take(limit)
        .getMany();

      const data = knowledge.map((item) => ({
        id: item.id,
        name: item.knowledge_name,
      }));

      return {
        success: true,
        message: 'Knowledge fetched successfully',
        data,
        current_page: page,
        per_page: limit,
        total_pages: Math.ceil(total / limit),
        total,
      };
    } catch (error) {
      throw new InternalServerErrorException({
        success: false,
        message: 'Failed to fetch knowledge',
        error: error.message,
      });
    }
  }
}
