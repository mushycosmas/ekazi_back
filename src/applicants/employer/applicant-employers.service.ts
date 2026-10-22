 import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ApplicantEmployers } from
  'src/entities/applicants/applicant-employers.entity';
import { Regions } from 'src/entities/regions.entity';

import { CreateApplicantEmployerDto } from
  './dto/create-applicant-employer.dto';
import { UpdateApplicantEmployerDto } from
  './dto/update-applicant-employer.dto';
  import { Brackets } from 'typeorm';

@Injectable()
export class ApplicantEmployersService {
  constructor(
    @InjectRepository(ApplicantEmployers)
    private readonly employersRepo: Repository<ApplicantEmployers>,

    @InjectRepository(Regions)
    private readonly regionsRepo: Repository<Regions>,
  ) {}

  // Format employer response
  private format(employer: ApplicantEmployers) {
    return {
      id: employer.id,
      employer_name: employer.employer_name,

      region: employer.region
        ? {
            id: employer.region.id,
            name: employer.region.region_name,
          }
        : null,

      sub_location: employer.sub_location,
      created_at: employer.created_at,
      updated_at: employer.updated_at,
    };
  }

  // Validate region exists
  private async validateRegion(regionId: number): Promise<Regions> {
    const region = await this.regionsRepo.findOne({
      where: { id: regionId },
    });

    if (!region) {
      throw new BadRequestException(
        `Region with ID ${regionId} was not found`,
      );
    }

    return region;
  }

  // CREATE
  async create(dto: CreateApplicantEmployerDto) {
    const region = await this.validateRegion(dto.region_id);

    const employer = this.employersRepo.create({
      employer_name: dto.employer_name.trim(),
      region_id: region.id,
      region,
      sub_location: dto.sub_location.trim(),
    });

    const saved = await this.employersRepo.save(employer);

    const result = await this.employersRepo.findOne({
      where: { id: saved.id },
      relations: { region: true },
    });

    return {
      success: true,
      message: 'Applicant employer created successfully',
      data: this.format(result!),
    };
  }

// applicant-employers.service.ts



async findAll(
  page = 1,
  limit = 20,
  search = '',
) {
  // Validate and normalize pagination
  page = Math.max(1, Number(page) || 1);
  limit = Math.min(100, Math.max(1, Number(limit) || 10));

  const query = this.employersRepo
    .createQueryBuilder('employer')
    .leftJoinAndSelect('employer.region', 'region');

  // Search employer name, region name, or sub-location
  if (search.trim()) {
    const keyword = `%${search.trim()}%`;

    query.andWhere(
      new Brackets((qb) => {
        qb.where('employer.employer_name LIKE :keyword', { keyword })
          .orWhere('region.region_name LIKE :keyword', { keyword })
          .orWhere('employer.sub_location LIKE :keyword', { keyword });
      }),
    );
  }

  query.orderBy('employer.id', 'DESC');

  const [employers, total] = await query
    .skip((page - 1) * limit)
    .take(limit)
    .getManyAndCount();

  return {
    success: true,
    message: 'Applicant employers retrieved successfully',
    data: employers.map((employer) => this.format(employer)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    
  };
}
  // READ ONE
  async findOne(id: number) {
    const employer = await this.employersRepo.findOne({
      where: { id },
      relations: { region: true },
    });

    if (!employer) {
      throw new NotFoundException(
        `Applicant employer with ID ${id} was not found`,
      );
    }

    return {
      success: true,
      message: 'Applicant employer retrieved successfully',
      data: this.format(employer),
    };
  }

  // UPDATE
  async update(
    id: number,
    dto: UpdateApplicantEmployerDto,
  ) {
    const employer = await this.employersRepo.findOne({
      where: { id },
      relations: { region: true },
    });

    if (!employer) {
      throw new NotFoundException(
        `Applicant employer with ID ${id} was not found`,
      );
    }

    if (dto.employer_name !== undefined) {
      employer.employer_name = dto.employer_name.trim();
    }

    if (dto.sub_location !== undefined) {
      employer.sub_location = dto.sub_location.trim();
    }

    if (dto.region_id !== undefined) {
      const region = await this.validateRegion(dto.region_id);

      employer.region_id = region.id;
      employer.region = region;
    }

    const saved = await this.employersRepo.save(employer);

    const result = await this.employersRepo.findOne({
      where: { id: saved.id },
      relations: { region: true },
    });

    return {
      success: true,
      message: 'Applicant employer updated successfully',
      data: this.format(result!),
    };
  }

  // DELETE
  async remove(id: number) {
    const employer = await this.employersRepo.findOne({
      where: { id },
    });

    if (!employer) {
      throw new NotFoundException(
        `Applicant employer with ID ${id} was not found`,
      );
    }

    // Do not delete an employer that is referenced by work experience.
    const positionsCount = await this.employersRepo.manager
      .getRepository('applicant_positions')
      .createQueryBuilder('pos')
      .where('pos.applicant_employer_id = :id', { id })
      .getCount();

    if (positionsCount > 0) {
      throw new BadRequestException(
        'This employer is referenced by applicant work experience and cannot be deleted.',
      );
    }

    await this.employersRepo.remove(employer);

    return {
      success: true,
      message: 'Applicant employer deleted successfully',
    };
  }
}