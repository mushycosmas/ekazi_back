import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, Not } from 'typeorm';

import { Status } from 'src/entities/status.entity';
import { CreateStatusDto } from './dto/create-status.dto';
import { UpdateStatusDto } from './dto/update-status.dto';

@Injectable()
export class StatusesService {
  constructor(
    @InjectRepository(Status)
    private readonly statusRepository: Repository<Status>,
  ) {}

  // CREATE
  async create(dto: CreateStatusDto) {
    const statusName = dto.status_name.trim();

    const existing = await this.statusRepository.findOne({
      where: { status_name: statusName },
    });

    if (existing) {
      throw new ConflictException('Status name already exists.');
    }

    const status = this.statusRepository.create({
      status_name: statusName,
      hide: dto.hide ?? '0',
    });

    const saved = await this.statusRepository.save(status);

    return {
      success: true,
      message: 'Status created successfully.',
      data: saved,
    };
  }

  // GET ALL WITH PAGINATION AND SEARCH
  async findAll(page = 1, limit = 10, search?: string) {
    const currentPage = Math.max(1, Number(page) || 1);
    const perPage = Math.min(100, Math.max(1, Number(limit) || 10));

    const query = this.statusRepository
      .createQueryBuilder('status')
      .where('status.hide = :hide', { hide: '0' });

    if (search?.trim()) {
      query.andWhere('status.status_name LIKE :search', {
        search: `%${search.trim()}%`,
      });
    }

    const [data, total] = await query
      .orderBy('status.id', 'DESC')
      .skip((currentPage - 1) * perPage)
      .take(perPage)
      .getManyAndCount();

    return {
      success: true,
      message: 'Statuses retrieved successfully.',
      data,
      pagination: {
        total,
        page: currentPage,
        limit: perPage,
        totalPages: Math.ceil(total / perPage),
      },
    };
  }

  // GET ONE
  async findOne(id: number) {
    const status = await this.statusRepository.findOne({
      where: { id },
    });

    if (!status) {
      throw new NotFoundException('Status not found.');
    }

    return {
      success: true,
      data: status,
    };
  }

  // UPDATE
  async update(id: number, dto: UpdateStatusDto) {
    const status = await this.statusRepository.findOne({
      where: { id },
    });

    if (!status) {
      throw new NotFoundException('Status not found.');
    }

    if (dto.status_name !== undefined) {
      const statusName = dto.status_name.trim();

      const existing = await this.statusRepository.findOne({
        where: {
          status_name: statusName,
          id: Not(id),
        },
      });

      if (existing) {
        throw new ConflictException('Status name already exists.');
      }

      status.status_name = statusName;
    }

    if (dto.hide !== undefined) {
      status.hide = dto.hide;
    }

    const saved = await this.statusRepository.save(status);

    return {
      success: true,
      message: 'Status updated successfully.',
      data: saved,
    };
  }

  // SOFT DELETE: hide the record rather than physically deleting it
  async remove(id: number) {
    const status = await this.statusRepository.findOne({
      where: { id },
    });

    if (!status) {
      throw new NotFoundException('Status not found.');
    }

    status.hide = '1';

    await this.statusRepository.save(status);

    return {
      success: true,
      message: 'Status hidden successfully.',
    };
  }
}