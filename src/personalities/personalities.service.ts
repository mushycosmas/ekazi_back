import { Injectable } from '@nestjs/common';
import { Personalities } from 'src/entities/personalities.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InternalServerErrorException } from '@nestjs/common';

@Injectable()
export class PersonalitiesService {
     constructor(
    @InjectRepository(Personalities)
    private readonly personalityRepository: Repository<Personalities>,
  ) {}

  async findAll(
    page = 1,
    limit = 20,
    search?: string,
  ) {
    try {
      const query = this.personalityRepository
        .createQueryBuilder('personality')
        .select([
          'personality.id',
          'personality.personality_name',
        ])
        .orderBy('personality.id', 'DESC');

      if (search) {
        query.where(
          'personality.personality_name LIKE :search',
          { search: `%${search}%` },
        );
      }

      const totalQuery = this.personalityRepository
        .createQueryBuilder('personality');

      if (search) {
        totalQuery.where(
          'personality.personality_name LIKE :search',
          { search: `%${search}%` },
        );
      }

      const totalResult = await totalQuery
        .select('COUNT(*)', 'count')
        .getRawOne();

      const total = Number(totalResult.count);

      const personalities = await query
        .skip((page - 1) * limit)
        .take(limit)
        .getMany();

      const data = personalities.map((item) => ({
        id: item.id,
        name: item.personality_name,
      }));

      return {
        success: true,
        message: 'Personalities fetched successfully',
        data,
        current_page: page,
        per_page: limit,
        total_pages: Math.ceil(total / limit),
        total,
      };
    } catch (error) {
      throw new InternalServerErrorException({
        success: false,
        message: 'Failed to fetch personalities',
        error: error.message,
      });
    }
  }
}
