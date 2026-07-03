import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Regions } from 'src/entities/regions.entity';
import { Repository } from 'typeorm';

@Injectable()
export class RegionsService {
    constructor(
        @InjectRepository(Regions)
        private readonly regionRepository: Repository<Regions>,
    ) { }

    async findAll(page = 1, limit = 20, search?: string) {
        const query = this.regionRepository
            .createQueryBuilder('region')
            .leftJoinAndSelect('region.country', 'country')
            .select([
                'region.id',
                'region.region_name',
                'region.slug',
                'country.id',
                'country.name',
            ])
            .orderBy('region.id', 'DESC');

        // ======================
        // SEARCH
        // ======================
        if (search) {
            query.where('region.region_name LIKE :search', {
                search: `%${search}%`,
            });
        }

        // ======================
        // TOTAL COUNT
        // ======================
        const totalQuery = this.regionRepository
            .createQueryBuilder('region');

        if (search) {
            totalQuery.where('region.region_name LIKE :search', {
                search: `%${search}%`,
            });
        }

        const totalResult = await totalQuery
            .select('COUNT(*)', 'count')
            .getRawOne();

        const total = Number(totalResult.count);

        // ======================
        // PAGINATION
        // ======================
        const regions = await query
            .skip((page - 1) * limit)
            .take(limit)
            .getMany();

        // ======================
        // FORMAT RESPONSE
        // ======================
        const data = regions.map((region) => ({
            id: region.id,
            name: region.region_name,
            slug: region.slug ?? null,
            country: region.country
                ? {
                    id: region.country.id,
                    name: region.country.name,
                }
                : null,
        }));

        return {
            success: true,
            message: 'Regions fetched successfully',
            data,
            current_page: page,
            per_page: limit,
            total_pages: Math.ceil(total / limit),
            total,
        };
    }
}