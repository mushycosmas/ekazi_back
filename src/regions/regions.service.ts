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

    async findAll(
        page = 1,
        limit = 20,
        search?: string,
    ) {
        const query = this.regionRepository
            .createQueryBuilder('region')
            .select([
                'MIN(region.id) as id',
                'region.region_name as region_name',
            ])
            .groupBy('region.region_name')
            .orderBy('region.id', 'DESC');

        if (search) {
            query.andWhere(
                'region.region_name LIKE :search',
                { search: `%${search}%` },
            );
        }

        const totalQuery = this.regionRepository
            .createQueryBuilder('region');

        if (search) {
            totalQuery.where(
                'region.region_name LIKE :search',
                { search: `%${search}%` },
            );
        }

        const totalResult = await totalQuery
            .select('COUNT(DISTINCT region.region_name)', 'count')
            .getRawOne();

        const total = Number(totalResult.count);

        const data = await query
            .offset((page - 1) * limit)
            .limit(limit)
            .getRawMany();

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