import { Injectable ,InternalServerErrorException} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Countries } from 'src/entities/countries.entity';
import { Repository } from 'typeorm';
 

@Injectable()
export class CountriesService {
     constructor(
    @InjectRepository(Countries)
    private readonly countryRepository: Repository<Countries>,
  ) {}

  async findAll(
    page = 1,
    limit = 20,
    search?: string,
  ) {
    try {
      const query = this.countryRepository
        .createQueryBuilder('country')
        .select([
          'MIN(country.id) as id',
          'country.name as ame',
        ])
        .groupBy('country.name')
        .orderBy('country.id', 'DESC');

      if (search) {
        query.andWhere(
          'country.name LIKE :search',
          { search: `%${search}%` },
        );
      }

      const totalQuery = this.countryRepository
        .createQueryBuilder('country');

      if (search) {
        totalQuery.where(
          'country.name LIKE :search',
          { search: `%${search}%` },
        );
      }

      const totalResult = await totalQuery
        .select('COUNT(DISTINCT country.name)', 'count')
        .getRawOne();

      const total = Number(totalResult.count);

      const data = await query
        .offset((page - 1) * limit)
        .limit(limit)
        .getRawMany();

      return {
        success: true,
        message: 'Countries fetched successfully',
        data,
        current_page: page,
        per_page: limit,
        total_pages: Math.ceil(total / limit),
        total,
      };
    } catch (error) {
      throw new InternalServerErrorException({
        success: false,
        message: 'Failed to fetch countries',
        error: error.message,
      });
    }
  }
}
