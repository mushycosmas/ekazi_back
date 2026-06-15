import { Injectable } from '@nestjs/common';
import { Organizations } from 'src/entities/organizations.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InternalServerErrorException } from '@nestjs/common';

@Injectable()
export class OrganizationsService {
     constructor(
    @InjectRepository(Organizations)
    private readonly organizationRepository: Repository<Organizations>,
  ) {}

  async findAll(
    page = 1,
    limit = 20,
    search?: string,
  ) {
    try {
      const query = this.organizationRepository
        .createQueryBuilder('organization')
        .select([
          'organization.id',
          'organization.organization_name',
        ])
        .orderBy('organization.id', 'DESC');

      if (search) {
        query.where(
          'organization.organization_name LIKE :search',
          { search: `%${search}%` },
        );
      }

      const totalQuery = this.organizationRepository
        .createQueryBuilder('organization');

      if (search) {
        totalQuery.where(
          'organization.organization_name LIKE :search',
          { search: `%${search}%` },
        );
      }

      const totalResult = await totalQuery
        .select('COUNT(*)', 'count')
        .getRawOne();

      const total = Number(totalResult.count);

      const organizations = await query
        .skip((page - 1) * limit)
        .take(limit)
        .getMany();

      const data = organizations.map((organization) => ({
        id: organization.id,
        name: organization.organization_name,
      }));

      return {
        success: true,
        message: 'Organizations fetched successfully',
        data,
        current_page: page,
        per_page: limit,
        total_pages: Math.ceil(total / limit),
        total,
      };
    } catch (error) {
      throw new InternalServerErrorException({
        success: false,
        message: 'Failed to fetch organizations',
        error: error.message,
      });
    }
  }
}
