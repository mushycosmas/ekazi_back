import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Languages } from 'src/entities/languages.entity';
import { Repository } from 'typeorm';
import { InternalServerErrorException } from '@nestjs/common';

@Injectable()
export class LanguagesService {
    constructor(
        @InjectRepository(Languages)
        private readonly languageRepository: Repository<Languages>,
    ) { }

    async findAll(
        page = 1,
        limit = 20,
        search?: string,
    ) {
        try {
            const query = this.languageRepository
                .createQueryBuilder('language')
                .select([
                    'MIN(language.id) as id',
                    'language.language_name as language_name',
                ])
                .groupBy('language.language_name')
                .orderBy('id', 'DESC');

            if (search) {
                query.andWhere(
                    'language.language_name LIKE :search',
                    { search: `%${search}%` },
                );
            }

            const totalQuery = this.languageRepository
                .createQueryBuilder('language');

            if (search) {
                totalQuery.where(
                    'language.language_name LIKE :search',
                    { search: `%${search}%` },
                );
            }

            const totalResult = await totalQuery
                .select('COUNT(DISTINCT language.language_name)', 'count')
                .getRawOne();

            const total = Number(totalResult.count);

            const data = await query
                .offset((page - 1) * limit)
                .limit(limit)
                .getRawMany();

            return {
                success: true,
                message: 'Languages fetched successfully',
                data,
                current_page: page,
                per_page: limit,
                total_pages: Math.ceil(total / limit),
                total,
            };
        } catch (error) {
            throw new InternalServerErrorException({
                success: false,
                message: 'Failed to fetch languages',
                error: error.message,
            });
        }
    }
}
