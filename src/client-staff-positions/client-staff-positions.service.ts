import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { ClientStaffPosition } from 'src/client/entities/client-staff-position.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ClientStaffPositionsService {
  constructor(
    @InjectRepository(ClientStaffPosition)
    private readonly clientStaffPositionRepository: Repository<ClientStaffPosition>,
  ) { }

  /**
   * Create
   */
  async create(
    position_name: string,
  ): Promise<ClientStaffPosition> {
    const position =
      this.clientStaffPositionRepository.create({
        position_name,
      });

    return await this.clientStaffPositionRepository.save(position);
  }

  /**
   * Get all
   */
async findAll(page: number = 1, limit: number = 20) {
  const skip = (page - 1) * limit;

  const [data, total] =
    await this.clientStaffPositionRepository.findAndCount({
      select: {
        id: true,
        position_name: true,
      },
      order: {
        id: 'DESC',
      },
      skip,
      take: limit,
    });

  const totalPages = Math.ceil(total / limit);

  return {
    success: true,
    message: 'Successful retrieve client staff positions',
    data,
    page,
    limit,
    total,
    totalPages,
  };
}

  /**
   * Get one
   */
  async findOne(id: number): Promise<ClientStaffPosition> {
    const position =
      await this.clientStaffPositionRepository.findOne({
        where: {
          id,
        },
      });

    if (!position) {
      throw new NotFoundException(
        `Client staff position with ID ${id} not found`,
      );
    }

    return position;
  }

  /**
   * Update
   */
  async update(
    id: number,
    position_name: string,
  ): Promise<ClientStaffPosition> {
    const position = await this.findOne(id);

    position.position_name = position_name;

    return await this.clientStaffPositionRepository.save(position);
  }

  /**
   * Delete
   */
  async remove(id: number): Promise<{ message: string }> {
    const position = await this.findOne(id);

    await this.clientStaffPositionRepository.remove(position);

    return {
      message: 'Client staff position deleted successfully',
    };
  }
}