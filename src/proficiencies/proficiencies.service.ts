import { Injectable } from '@nestjs/common';
import { Proficiencies } from 'src/entities/proficiencies.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InternalServerErrorException } from '@nestjs/common';

@Injectable()
export class ProficienciesService {
      constructor(
    @InjectRepository(Proficiencies)
    private readonly proficiencyRepository: Repository<Proficiencies>,
  ) {}

  async findAll(
    page = 1,
    limit = 20,
    search?: string,
  ) {
    try {
      const query = this.proficiencyRepository
        .createQueryBuilder('proficiency')
        .select([
          'proficiency.id',
          'proficiency.proficiency_name',
        ])
        .orderBy('proficiency.id', 'DESC');

      if (search) {
        query.where(
          'proficiency.proficiency_name LIKE :search',
          { search: `%${search}%` },
        );
      }

      const totalQuery = this.proficiencyRepository
        .createQueryBuilder('proficiency');

      if (search) {
        totalQuery.where(
          'proficiency.proficiency_name LIKE :search',
          { search: `%${search}%` },
        );
      }

      const totalResult = await totalQuery
        .select('COUNT(*)', 'count')
        .getRawOne();

      const total = Number(totalResult.count);

      const proficiencies = await query
        .skip((page - 1) * limit)
        .take(limit)
        .getMany();

      const data = proficiencies.map((item) => ({
        id: item.id,
        name: item.proficiency_name,
      }));

      return {
        success: true,
        message: 'Proficiencies fetched successfully',
        data,
        current_page: page,
        per_page: limit,
        total_pages: Math.ceil(total / limit),
        total,
      };
    } catch (error) {
      throw new InternalServerErrorException({
        success: false,
        message: 'Failed to fetch proficiencies',
        error: error.message,
      });
    }
  }
}
